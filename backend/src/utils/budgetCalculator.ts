/**
 * Budget Calculator
 *
 * Pure functions only — no I/O, no Mongoose. Kept separate from
 * budget.service.ts so the arithmetic can be unit tested without a
 * database, and reused by analytics.service.ts for utilization
 * reporting without duplicating the formulas.
 */

export interface BudgetAmounts {
  allocatedAmount: number;
  spentAmount: number;
  reservedAmount: number;
}

export const calculateRemaining = ({
  allocatedAmount,
  spentAmount,
  reservedAmount,
}: BudgetAmounts): number => {
  return allocatedAmount - spentAmount - reservedAmount;
};

export const calculateUtilizationPercent = ({
  allocatedAmount,
  spentAmount,
  reservedAmount,
}: BudgetAmounts): number => {
  if (allocatedAmount === 0) return 0;
  return Number((((spentAmount + reservedAmount) / allocatedAmount) * 100).toFixed(2));
};

export const isOverThreshold = (amounts: BudgetAmounts, warningThresholdPercent: number): boolean => {
  return calculateUtilizationPercent(amounts) >= warningThresholdPercent;
};

export interface PurchaseCheckInput extends BudgetAmounts {
  purchaseLimit: number;
  status: "active" | "exhausted" | "closed";
  amount: number;
}

export interface PurchaseCheckOutcome {
  allowed: boolean;
  reason?: string;
  requiresEscalation: boolean;
}

/** Shared by budget.service.checkPurchaseAllowed and any other module validating a spend against a budget. */
export const evaluatePurchase = (input: PurchaseCheckInput): PurchaseCheckOutcome => {
  if (input.status !== "active") {
    return { allowed: false, reason: `Budget is ${input.status}.`, requiresEscalation: false };
  }

  const remaining = calculateRemaining(input);
  if (input.amount > remaining) {
    return { allowed: false, reason: "Amount exceeds remaining budget.", requiresEscalation: false };
  }

  if (input.amount > input.purchaseLimit) {
    return {
      allowed: false,
      reason: "Amount exceeds the single-purchase limit for this budget.",
      requiresEscalation: true,
    };
  }

  return { allowed: true, requiresEscalation: false };
};

/** Derives status the same way the model's pre-save hook does, for use outside a hydrated document. */
export const deriveBudgetStatus = (
  amounts: BudgetAmounts,
  currentStatus: "active" | "exhausted" | "closed"
): "active" | "exhausted" | "closed" => {
  if (currentStatus === "closed") return "closed";
  return calculateRemaining(amounts) <= 0 ? "exhausted" : "active";
};
