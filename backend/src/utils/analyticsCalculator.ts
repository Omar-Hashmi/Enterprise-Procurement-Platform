/**
 * Analytics Calculator
 *
 * Pure functions only — analytics.repository.ts pulls raw aggregates
 * from MongoDB, and analytics.service.ts uses these to turn them into
 * the shaped, presentation-ready numbers the dashboard needs.
 */

export interface VendorRatingBreakdown {
  deliveryScore: number;
  qualityScore: number;
  costEfficiencyScore: number;
  complianceScore: number;
}

/** Averages a vendor's rating dimensions across all ratings they've received. */
export const calculateVendorPerformance = (
  ratings: VendorRatingBreakdown[]
): VendorRatingBreakdown & { overall: number } => {
  if (ratings.length === 0) {
    return { deliveryScore: 0, qualityScore: 0, costEfficiencyScore: 0, complianceScore: 0, overall: 0 };
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
    (breakdown.deliveryScore + breakdown.qualityScore + breakdown.costEfficiencyScore + breakdown.complianceScore) / 4
  );

  return { ...breakdown, overall };
};

export interface DepartmentSpend {
  department: string;
  allocated: number;
  spent: number;
  reserved: number;
}

export const calculateUtilizationByDepartment = (
  rows: DepartmentSpend[]
): Array<DepartmentSpend & { utilizationPercent: number }> => {
  return rows.map((row) => ({
    ...row,
    utilizationPercent: row.allocated === 0 ? 0 : round(((row.spent + row.reserved) / row.allocated) * 100),
  }));
};

export interface TrendPoint {
  period: string; // e.g. "2026-01"
  amount: number;
}

/** Percent change between the latest two points in a trend series. Positive = growth. */
export const calculateTrendGrowth = (points: TrendPoint[]): number | null => {
  if (points.length < 2) return null;
  const [previous, current] = points.slice(-2);
  if (previous.amount === 0) return null;
  return round(((current.amount - previous.amount) / previous.amount) * 100);
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

const round = (value: number): number => Number(value.toFixed(2));
