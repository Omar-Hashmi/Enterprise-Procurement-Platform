// File: analytics.repository.js

const { Vendor } = require("../models/vendor.model");
const { RFQ } = require("../models/RFQ");
const { Budget } = require("../models/Budget");
const { Contract } = require("../models/Contract");
const { Inventory } = require("../models/Inventory");

/**
 * Repository Pattern — Analytics has no collection of its own; this
 * repository's job is purely to run aggregation pipelines against the
 * other owned collections and hand back raw numbers. All shaping
 * (percentages, rankings, growth) happens in analyticsCalculator.js /
 * analytics.service.js, not here.
 */
class AnalyticsRepository {
  async vendorRankings(limit) {
    const results = await Vendor.aggregate([
      { $match: { status: "active" } },
      {
        $project: {
          companyName: 1,
          averageRating: 1,
          ratingCount: { $size: "$ratings" },
        },
      },
      { $sort: { averageRating: -1 } },
      { $limit: limit },
    ]).exec();

    return results.map((r) => ({
      vendorId: r._id.toString(),
      companyName: r.companyName,
      averageRating: r.averageRating,
      ratingCount: r.ratingCount,
    }));
  }

  async vendorRatingBreakdown(vendorId) {
    const vendor = await Vendor.findById(vendorId).select("ratings").exec();
    if (!vendor) return [];

    return vendor.ratings.map((r) => ({
      deliveryScore: r.deliveryScore,
      qualityScore: r.qualityScore,
      costEfficiencyScore: r.costEfficiencyScore,
      complianceScore: r.complianceScore,
    }));
  }

  async departmentSpending(fiscalYear) {
    const match = {};
    if (fiscalYear) match.fiscalYear = fiscalYear;

    const results = await Budget.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$department",
          allocated: { $sum: "$allocatedAmount" },
          spent: { $sum: "$spentAmount" },
          reserved: { $sum: "$reservedAmount" },
        },
      },
    ]).exec();

    return results.map((r) => ({
      department: r._id.toString(),
      allocated: r.allocated,
      spent: r.spent,
      reserved: r.reserved,
    }));
  }

  /**
   * `range` narrows the trend window to the trailing N months
   * ('1M' -> 1, '6M' -> 6, '1Y' -> 12). Omit it to return the full
   * fiscal year.
   */
  async procurementSpendTrend(fiscalYear, range) {
    const RANGE_TO_MONTHS = { "1M": 1, "6M": 6, "1Y": 12 };
    const months = RANGE_TO_MONTHS[range];

    const transactionMatch = { "transactions.type": "deduction" };
    if (months) {
      const since = new Date();
      since.setMonth(since.getMonth() - months);
      transactionMatch["transactions.createdAt"] = { $gte: since };
    }

    const results = await Budget.aggregate([
      { $match: { fiscalYear } },
      { $unwind: "$transactions" },
      { $match: transactionMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$transactions.createdAt" } },
          amount: { $sum: "$transactions.amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    return results.map((r) => ({ period: r._id, amount: r.amount }));
  }

  async rfqStatusCounts() {
    return this.countBy(RFQ, "status");
  }

  async vendorStatusCounts() {
    return this.countBy(Vendor, "status");
  }

  async budgetStatusCounts() {
    return this.countBy(Budget, "status");
  }

  async contractStatusCounts() {
    return this.countBy(Contract, "status");
  }

  async pendingDeliveriesCount() {
    return Inventory.countDocuments({ deliveryStatus: { $in: ["pending", "partially_received"] } }).exec();
  }

  async activeVendorCount() {
    return Vendor.countDocuments({ status: "active" }).exec();
  }

  async openRFQCount() {
    return RFQ.countDocuments({
      status: { $in: ["published", "quotes_received", "under_evaluation"] },
    }).exec();
  }

  async activeContractCount() {
    return Contract.countDocuments({ status: { $in: ["active", "expiring_soon"] } }).exec();
  }

  async complianceDocumentStats() {
    const results = await Contract.aggregate([
      { $unwind: "$complianceDocuments" },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { $sum: { $cond: ["$complianceDocuments.verified", 1, 0] } },
        },
      },
    ]).exec();

    if (results.length === 0) return { total: 0, verified: 0 };
    return { total: results[0].total, verified: results[0].verified };
  }

  async countBy(model, field) {
    const results = await model
      .aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }])
      .exec();

    return results.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

const analyticsRepository = new AnalyticsRepository();

module.exports = {
  AnalyticsRepository,
  analyticsRepository,
};