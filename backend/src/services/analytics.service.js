// File: analytics.service.js

const { analyticsRepository } = require("../repositories/analytics.repository");
const { cacheService, CacheKeys } = require("./cache.service");
const {
  calculateVendorPerformance,
  calculateUtilizationByDepartment,
  calculateTrendGrowth,
} = require("../utils/analyticsCalculator");

const DASHBOARD_CACHE_TTL_SECONDS = 300; // 5 minutes — matches the case study's "Dashboard cache" requirement
const VENDOR_RANKINGS_CACHE_TTL_SECONDS = 900; // 15 minutes — ratings change less often

/**
 * Service Layer — turns raw aggregates from analytics.repository.js
 * into the shaped numbers the Analytics Dashboard displays: vendor
 * rankings, budget utilization, department spending, procurement KPIs.
 * Expensive cross-collection queries are cached (Redis) since this
 * data doesn't need to be real-time to the second.
 */
class AnalyticsService {
  async getVendorRankings(limit = 10) {
    return cacheService.getOrSet(
      CacheKeys.vendorRankings(limit),
      () => analyticsRepository.vendorRankings(limit),
      VENDOR_RANKINGS_CACHE_TTL_SECONDS
    );
  }

  async getVendorPerformance(vendorId) {
    const ratings = await analyticsRepository.vendorRatingBreakdown(vendorId);
    return calculateVendorPerformance(ratings);
  }

  async getBudgetUtilization(fiscalYear) {
    return cacheService.getOrSet(
      CacheKeys.budgetUtilization(fiscalYear),
      async () => {
        const rows = await analyticsRepository.departmentSpending(fiscalYear);
        return calculateUtilizationByDepartment(rows);
      },
      DASHBOARD_CACHE_TTL_SECONDS
    );
  }

  async getDepartmentSpending(fiscalYear) {
    return analyticsRepository.departmentSpending(fiscalYear);
  }

  async getProcurementSpendTrend(fiscalYear) {
    const trend = await analyticsRepository.procurementSpendTrend(fiscalYear);
    return {
      points: trend,
      growthPercent: calculateTrendGrowth(trend),
    };
  }

  async getContractComplianceRate() {
    const { total, verified } = await analyticsRepository.complianceDocumentStats();
    return {
      total,
      verified,
      compliancePercent: total === 0 ? 0 : Number(((verified / total) * 100).toFixed(2)),
    };
  }

  /** Procurement KPIs — the single payload the main dashboard view renders. */
  async getDashboardSummary() {
    return cacheService.getOrSet(
      CacheKeys.dashboardSummary(),
      async () => {
        const [
          vendorStatusCounts,
          rfqStatusCounts,
          budgetStatusCounts,
          contractStatusCounts,
          pendingDeliveries,
          activeVendors,
          openRFQs,
          activeContracts,
          compliance,
        ] = await Promise.all([
          analyticsRepository.vendorStatusCounts(),
          analyticsRepository.rfqStatusCounts(),
          analyticsRepository.budgetStatusCounts(),
          analyticsRepository.contractStatusCounts(),
          analyticsRepository.pendingDeliveriesCount(),
          analyticsRepository.activeVendorCount(),
          analyticsRepository.openRFQCount(),
          analyticsRepository.activeContractCount(),
          analyticsRepository.complianceDocumentStats(),
        ]);

        return {
          vendors: { statusCounts: vendorStatusCounts, active: activeVendors },
          rfqs: { statusCounts: rfqStatusCounts, open: openRFQs },
          budgets: { statusCounts: budgetStatusCounts },
          contracts: {
            statusCounts: contractStatusCounts,
            active: activeContracts,
            compliancePercent:
              compliance.total === 0
                ? 0
                : Number(((compliance.verified / compliance.total) * 100).toFixed(2)),
          },
          inventory: { pendingDeliveries },
          generatedAt: new Date().toISOString(),
        };
      },
      DASHBOARD_CACHE_TTL_SECONDS
    );
  }

  /** Invalidate the dashboard cache — call after any write that would change these numbers materially. */
  async invalidateDashboardCache() {
    await cacheService.del(CacheKeys.dashboardSummary());
  }
}

const analyticsService = new AnalyticsService();

module.exports = {
  AnalyticsService,
  analyticsService,
};