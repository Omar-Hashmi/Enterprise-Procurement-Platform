// File: analyticsCalculator.js

/**
 * Analytics Calculator
 * Pure functions only — analytics.repository.js pulls raw aggregates
 * from MongoDB, and analytics.service.js uses these to turn them into
 * the shaped, presentation-ready numbers the dashboard needs.
 */

const round = (value) => Number(value.toFixed(2));

/** Averages a vendor's rating dimensions across all ratings they've received. */
const calculateVendorPerformance = (ratings) => {
  if (ratings.length === 0) {
    return {
      deliveryScore: 0,
      qualityScore: 0,
      costEfficiencyScore: 0,
      complianceScore: 0,
      overall: 0,
    };
  }

  const sums = ratings.reduce(
    (acc, r) => ({
      deliveryScore: acc.deliveryScore + r.deliveryScore,
      qualityScore: acc.qualityScore + r.qualityScore,
      costEfficiencyScore: acc.costEfficiencyScore + r.costEfficiencyScore,
      complianceScore: acc.complianceScore + r.complianceScore,
    }),
    { deliveryScore: 0, qualityScore: 0, costEfficiencyScore: 0, complianceScore: 0 }
  );

  const n = ratings.length;
  const breakdown = {
    deliveryScore: round(sums.deliveryScore / n),
    qualityScore: round(sums.qualityScore / n),
    costEfficiencyScore: round(sums.costEfficiencyScore / n),
    complianceScore: round(sums.complianceScore / n),
  };

  const overall = round(
    (breakdown.deliveryScore +
      breakdown.qualityScore +
      breakdown.costEfficiencyScore +
      breakdown.complianceScore) /
      4
  );

  return { ...breakdown, overall };
};

const calculateUtilizationByDepartment = (rows) => {
  return rows.map((row) => ({
    ...row,
    utilizationPercent:
      row.allocated === 0
        ? 0
        : round(((row.spent + row.reserved) / row.allocated) * 100),
  }));
};

/** Percent change between the latest two points in a trend series. Positive = growth. */
const calculateTrendGrowth = (points) => {
  if (points.length < 2) return null;
  const [previous, current] = points.slice(-2);
  if (previous.amount === 0) return null;
  return round(((current.amount - previous.amount) / previous.amount) * 100);
};

const calculateAverage = (values) => {
  if (values.length === 0) return 0;
  return round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

module.exports = {
  calculateVendorPerformance,
  calculateUtilizationByDepartment,
  calculateTrendGrowth,
  calculateAverage,
};