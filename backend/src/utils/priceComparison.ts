/**
 * Price Comparison
 *
 * Pure functions only. rfq.service.compareQuotations() uses this to
 * turn a raw quotations array into a ranked comparison view instead
 * of just a price-sorted list.
 */

export interface ComparableQuotation {
  vendorId: string;
  totalQuoteAmount: number;
  deliveryDays: number;
  technicalScore?: number;
}

export interface RankedQuotation extends ComparableQuotation {
  priceRank: number;
  isLowestPrice: boolean;
  isFastestDelivery: boolean;
  compositeScore: number;
}

export interface ComparisonWeights {
  price: number;
  delivery: number;
  technical: number;
}

const DEFAULT_WEIGHTS: ComparisonWeights = { price: 0.5, delivery: 0.2, technical: 0.3 };

/**
 * Normalizes a metric to a 0–100 score where lower raw values score
 * higher (used for price and delivery days, where "less" is better).
 */
const normalizeInverse = (value: number, min: number, max: number): number => {
  if (max === min) return 100;
  return ((max - value) / (max - min)) * 100;
};

export const compareQuotations = (
  quotations: ComparableQuotation[],
  weights: ComparisonWeights = DEFAULT_WEIGHTS
): RankedQuotation[] => {
  if (quotations.length === 0) return [];

  const prices = quotations.map((q) => q.totalQuoteAmount);
  const deliveries = quotations.map((q) => q.deliveryDays);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDelivery = Math.min(...deliveries);
  const maxDelivery = Math.max(...deliveries);

  const byPriceAscending = [...quotations].sort((a, b) => a.totalQuoteAmount - b.totalQuoteAmount);
  const priceRankByVendor = new Map(byPriceAscending.map((q, i) => [q.vendorId, i + 1]));

  return quotations
    .map((q) => {
      const priceScore = normalizeInverse(q.totalQuoteAmount, minPrice, maxPrice);
      const deliveryScore = normalizeInverse(q.deliveryDays, minDelivery, maxDelivery);
      const technicalScore = q.technicalScore ?? 0;

      const compositeScore = Number(
        (
          priceScore * weights.price +
          deliveryScore * weights.delivery +
          technicalScore * weights.technical
        ).toFixed(2)
      );

      return {
        ...q,
        priceRank: priceRankByVendor.get(q.vendorId) ?? 0,
        isLowestPrice: q.totalQuoteAmount === minPrice,
        isFastestDelivery: q.deliveryDays === minDelivery,
        compositeScore,
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);
};

/** Convenience helper when you only care about the cheapest option. */
export const findLowestPriceQuotation = <T extends { totalQuoteAmount: number }>(
  quotations: T[]
): T | undefined => {
  return quotations.reduce<T | undefined>((lowest, current) => {
    if (!lowest || current.totalQuoteAmount < lowest.totalQuoteAmount) return current;
    return lowest;
  }, undefined);
};
