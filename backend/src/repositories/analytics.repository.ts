import { Model } from "mongoose";
import { Vendor } from "../models/Vendor";
import { RFQ } from "../models/RFQ";
import { Budget } from "../models/Budget";
import { Contract } from "../models/Contract";
import { Inventory } from "../models/Inventory";
import { VendorRatingBreakdown, DepartmentSpend } from "../utils/analyticsCalculator";

/**
 * Repository Pattern — Analytics has no collection of its own; this
 * repository's job is purely to run aggregation pipelines against the
 * other owned collections and hand back raw numbers. All shaping
 * (percentages, rankings, growth) happens in analyticsCalculator.ts /
 * analytics.service.ts, not here.
 */
class AnalyticsRepository {
  async vendorRankings(limit: number): Promise<
    Array<{ vendorId: string; companyName: string; averageRating: number; ratingCount: number }>
  > {
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

  async vendorRatingBreakdown(vendorId: string): Promise<VendorRatingBreakdown[]> {
    const vendor = await Vendor.findById(vendorId).select("ratings").exec();
    if (!vendor) return [];

    return vendor.ratings.map((r) => ({
      deliveryScore: r.deliveryScore,
      qualityScore: r.qualityScore,
      costEfficiencyScore: r.costEfficiencyScore,
      complianceScore: r.complianceScore,
    }));
  }

  async departmentSpending(fiscalYear?: number): Promise<DepartmentSpend[]> {
    const match: Record<string, unknown> = {};
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

  async procurementSpendTrend(fiscalYear: number): Promise<Array<{ period: string; amount: number }>> {
    const results = await Budget.aggregate([
      { $match: { fiscalYear } },
      { $unwind: "$transactions" },
      { $match: { "transactions.type": "deduction" } },
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

  async rfqStatusCounts(): Promise<Record<string, number>> {
    return this.countBy(RFQ, "status");
  }

  async vendorStatusCounts(): Promise<Record<string, number>> {
    return this.countBy(Vendor, "status");
  }

  async budgetStatusCounts(): Promise<Record<string, number>> {
    return this.countBy(Budget, "status");
  }

  async contractStatusCounts(): Promise<Record<string, number>> {
    return this.countBy(Contract, "status");
  }

  async pendingDeliveriesCount(): Promise<number> {
    return Inventory.countDocuments({ deliveryStatus: { $in: ["pending", "partially_received"] } }).exec();
  }

  async activeVendorCount(): Promise<number> {
    return Vendor.countDocuments({ status: "active" }).exec();
  }

  async openRFQCount(): Promise<number> {
    return RFQ.countDocuments({
      status: { $in: ["published", "quotes_received", "under_evaluation"] },
    }).exec();
  }

  async activeContractCount(): Promise<number> {
    return Contract.countDocuments({ status: { $in: ["active", "expiring_soon"] } }).exec();
  }

  async complianceDocumentStats(): Promise<{ total: number; verified: number }> {
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

  private async countBy<T>(model: Model<T>, field: string): Promise<Record<string, number>> {
    const results = await model
      .aggregate<{ _id: string; count: number }>([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }])
      .exec();

    return results.reduce((acc: Record<string, number>, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

export const analyticsRepository = new AnalyticsRepository();
