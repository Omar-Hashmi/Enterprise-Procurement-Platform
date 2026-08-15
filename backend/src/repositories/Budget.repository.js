// File: budget.repository.js

const { Types } = require("mongoose");
const { Budget } = require("../models/Budget");

/**
 * Repository Pattern — isolates all Mongoose/DB access for Budget so the
 * service layer stays persistence-agnostic and easy to unit test.
 */
class BudgetRepository {
  async create(payload) {
    return Budget.create(payload);
  }

  async findById(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Budget.findById(id).populate("department").populate("project").exec();
  }

  async findByKey(department, fiscalYear, project) {
    return Budget.findOne({
      department,
      fiscalYear,
      project: project ?? { $exists: false },
    }).exec();
  }

  async findAll(filter, { page, limit }) {
    const query = {};

    if (filter.department) query.department = filter.department;
    if (filter.project) query.project = filter.project;
    if (filter.fiscalYear) query.fiscalYear = filter.fiscalYear;
    if (filter.status) query.status = filter.status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Budget.find(query)
        .populate("department")
        .populate("project")
        .sort({ fiscalYear: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Budget.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id, payload) {
    return Budget.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
  }

  async updateStatus(id, status) {
    return Budget.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).exec();
  }

  /**
   * Applies a signed delta to allocated/spent/reserved amounts and logs the
   * transaction in a single save, so the pre-save hook recomputes
   * remainingAmount/status consistently with the ledger entry.
   */
  async applyTransaction(id, transaction, adjustments) {
    const budget = await Budget.findById(id).exec();
    if (!budget) return null;

    if (adjustments.allocatedDelta) {
      budget.allocatedAmount += adjustments.allocatedDelta;
    }
    if (adjustments.spentDelta) {
      budget.spentAmount += adjustments.spentDelta;
    }
    if (adjustments.reservedDelta) {
      budget.reservedAmount = Math.max(0, budget.reservedAmount + adjustments.reservedDelta);
    }

    budget.transactions.push(transaction);
    await budget.save(); // triggers pre-save hook: recomputes remainingAmount + status
    return budget;
  }

  async findActiveOrExhausted() {
    return Budget.find({ status: { $in: ["active", "exhausted"] } })
      .populate("department")
      .exec();
  }

  async countByStatus() {
    const results = await Budget.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();

    return results.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

const budgetRepository = new BudgetRepository();

module.exports = {
  BudgetRepository,
  budgetRepository,
};