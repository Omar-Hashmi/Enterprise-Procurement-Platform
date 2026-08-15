// File: budget.service.js

const { budgetRepository } = require("../repositories/budget.repository");
const { AppError } = require("../utils/AppError");

/**
 * Service Layer — encapsulates budget allocation, reservation, spend,
 * and warning-threshold business rules. Every amount-changing operation
 * writes a ledger entry via budgetRepository.applyTransaction so the
 * transaction history and derived totals never drift apart.
 */
class BudgetService {
  async createBudget(input) {
    if (input.allocatedAmount <= 0) {
      throw new AppError("Allocated amount must be greater than zero.", 400);
    }
    if (input.purchaseLimit <= 0 || input.purchaseLimit > input.allocatedAmount) {
      throw new AppError("Purchase limit must be positive and cannot exceed the allocated amount.", 400);
    }

    const existing = await budgetRepository.findByKey(
      input.department,
      input.fiscalYear,
      input.project
    );
    if (existing) {
      throw new AppError(
        "A budget already exists for this department/project in the given fiscal year.",
        409
      );
    }

    const initialTransaction = {
      type: "allocation",
      amount: input.allocatedAmount,
      note: "Initial allocation",
      performedBy: input.createdBy,
      createdAt: new Date(),
    };

    return budgetRepository.create({
      department: input.department,
      project: input.project,
      fiscalYear: input.fiscalYear,
      period: input.period,
      allocatedAmount: input.allocatedAmount,
      spentAmount: 0,
      reservedAmount: 0,
      purchaseLimit: input.purchaseLimit,
      warningThresholdPercent: input.warningThresholdPercent ?? 80,
      status: "active",
      transactions: [initialTransaction],
      createdBy: input.createdBy,
    });
  }

  async getBudgets(filter, pagination) {
    return budgetRepository.findAll(filter, pagination);
  }

  async getBudgetById(id) {
    const budget = await budgetRepository.findById(id);
    if (!budget) throw new AppError("Budget not found.", 404);
    return budget;
  }

  async updateBudget(id, payload) {
    // allocatedAmount/spentAmount/reservedAmount only ever move through the
    // ledger methods below, so they're never accepted on a generic PATCH.
    const {
      allocatedAmount,
      spentAmount,
      reservedAmount,
      remainingAmount,
      status,
      transactions,
      ...safePayload
    } = payload;

    const budget = await budgetRepository.update(id, safePayload);
    if (!budget) throw new AppError("Budget not found.", 404);
    return budget;
  }

  /** Adds funds to the total allocated pool (e.g. mid-year top-up). */
  async topUpBudget(id, input) {
    if (input.amount <= 0) throw new AppError("Top-up amount must be greater than zero.", 400);

    const budget = await this.getBudgetById(id);
    if (budget.status === "closed") {
      throw new AppError("Cannot top up a closed budget.", 400);
    }

    return this.applyTransaction(id, "allocation", input, { allocatedDelta: input.amount });
  }

  /** Commits funds against an open PO/RFQ without recording an actual spend yet. */
  async reserveFunds(id, input) {
    if (input.amount <= 0) throw new AppError("Reservation amount must be greater than zero.", 400);

    const budget = await this.getBudgetById(id);
    this.assertActive(budget);

    if (input.amount > budget.purchaseLimit) {
      throw new AppError(
        `Amount exceeds the purchase limit of ${budget.purchaseLimit} for this budget and requires escalation.`,
        400
      );
    }
    if (input.amount > budget.remainingAmount) {
      throw new AppError("Insufficient remaining budget for this reservation.", 400);
    }

    return this.applyTransaction(id, "reservation", input, { reservedDelta: input.amount });
  }

  /** Releases a previously reserved amount back to the available pool without spending it. */
  async releaseReservation(id, input) {
    if (input.amount <= 0) throw new AppError("Release amount must be greater than zero.", 400);

    const budget = await this.getBudgetById(id);
    if (input.amount > budget.reservedAmount) {
      throw new AppError("Cannot release more than is currently reserved.", 400);
    }

    return this.applyTransaction(id, "release", input, { reservedDelta: -input.amount });
  }

  /**
   * Records an actual expense. If the amount was previously reserved,
   * pass releaseReservedAmount=true to move it from reserved -> spent
   * instead of double-counting against remainingAmount.
   */
  async recordExpense(id, input, releaseReservedAmount = true) {
    if (input.amount <= 0) throw new AppError("Expense amount must be greater than zero.", 400);

    const budget = await this.getBudgetById(id);

    if (releaseReservedAmount) {
      if (input.amount > budget.reservedAmount) {
        throw new AppError("Expense exceeds the amount currently reserved for this reference.", 400);
      }
      return this.applyTransaction(id, "deduction", input, {
        spentDelta: input.amount,
        reservedDelta: -input.amount,
      });
    }

    if (input.amount > budget.remainingAmount) {
      throw new AppError("Insufficient remaining budget for this expense.", 400);
    }
    return this.applyTransaction(id, "deduction", input, { spentDelta: input.amount });
  }

  /** Manual correction to the allocated pool — amount may be negative. */
  async adjustBudget(id, input) {
    if (input.amount === 0) throw new AppError("Adjustment amount cannot be zero.", 400);
    if (!input.note) throw new AppError("A note explaining the adjustment is required.", 400);

    const budget = await this.getBudgetById(id);
    if (budget.allocatedAmount + input.amount < budget.spentAmount + budget.reservedAmount) {
      throw new AppError(
        "This adjustment would reduce the allocated amount below what is already committed.",
        400
      );
    }

    return this.applyTransaction(id, "adjustment", input, { allocatedDelta: input.amount });
  }

  async closeBudget(id) {
    const budget = await this.getBudgetById(id);
    if (budget.status === "closed") throw new AppError("Budget is already closed.", 400);
    if (budget.reservedAmount > 0) {
      throw new AppError("Release all outstanding reservations before closing this budget.", 400);
    }

    const updated = await budgetRepository.updateStatus(id, "closed");
    if (!updated) throw new AppError("Budget not found.", 404);
    return updated;
  }

  /** Used by other modules (e.g. RFQ/PO) to check a purchase before committing it. */
  async checkPurchaseAllowed(id, amount) {
    const budget = await this.getBudgetById(id);

    if (budget.status !== "active") {
      return { allowed: false, reason: `Budget is ${budget.status}.`, requiresEscalation: false };
    }
    if (amount > budget.remainingAmount) {
      return { allowed: false, reason: "Amount exceeds remaining budget.", requiresEscalation: false };
    }
    if (amount > budget.purchaseLimit) {
      return {
        allowed: false,
        reason: "Amount exceeds the single-purchase limit for this budget.",
        requiresEscalation: true,
      };
    }
    return { allowed: true, requiresEscalation: false };
  }

  /** Budget Warnings — budgets at or beyond their configured utilization threshold. */
  async getBudgetsOverThreshold() {
    const budgets = await budgetRepository.findActiveOrExhausted();
    return budgets.filter((b) => {
      if (b.allocatedAmount === 0) return false;
      const utilization = ((b.spentAmount + b.reservedAmount) / b.allocatedAmount) * 100;
      return utilization >= b.warningThresholdPercent;
    });
  }

  async getBudgetStatusSummary() {
    return budgetRepository.countByStatus();
  }

  assertActive(budget) {
    if (budget.status !== "active") {
      throw new AppError(`Budget is ${budget.status} and cannot accept new commitments.`, 400);
    }
  }

  async applyTransaction(id, type, input, adjustments) {
    const transaction = {
      type,
      amount: input.amount,
      reference: input.reference,
      referenceType: input.referenceType,
      note: input.note,
      performedBy: input.performedBy,
      createdAt: new Date(),
    };

    const updated = await budgetRepository.applyTransaction(id, transaction, adjustments);
    if (!updated) throw new AppError("Budget not found.", 404);
    return updated;
  }
}

const budgetService = new BudgetService();

module.exports = {
  BudgetService,
  budgetService,
};