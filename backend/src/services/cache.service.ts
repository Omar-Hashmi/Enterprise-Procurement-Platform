import { redisClient } from "../cache/redis";

/**
 * Cache Service
 *
 * Generic get/set/invalidate wrapper plus a getOrSet helper, used by
 * analytics.service.ts (dashboard cache) and vendor.service.ts
 * (vendor list/detail cache) so query-heavy read paths don't hit
 * MongoDB on every request.
 */

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redisClient.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redisClient.set(key, serialized, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  /** Deletes every key matching a prefix, e.g. "vendor:*" after a vendor write. */
  async delByPattern(pattern: string): Promise<void> {
    const stream = redisClient.scanStream({ match: pattern, count: 100 });

    const keysToDelete: string[] = [];
    for await (const keys of stream) {
      keysToDelete.push(...(keys as string[]));
    }

    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
    }
  }

  /**
   * Returns the cached value if present; otherwise calls `fetcher`,
   * caches the result, and returns it. The standard pattern for
   * dashboard/analytics endpoints that are expensive to compute.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}

export const cacheService = new CacheService();

/** Common cache key builders so producers/invalidators never drift apart. */
export const CacheKeys = {
  vendorList: (queryHash: string) => `vendor:list:${queryHash}`,
  vendorDetail: (id: string) => `vendor:detail:${id}`,
  dashboardSummary: () => "analytics:dashboard:summary",
  vendorRankings: (limit: number) => `analytics:vendor-rankings:${limit}`,
  budgetUtilization: (fiscalYear: number) => `analytics:budget-utilization:${fiscalYear}`,
};
