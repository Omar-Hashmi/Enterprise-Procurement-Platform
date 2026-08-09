// File: cache.service.js

const { redisClient } = require("../config/redis");

/**
 * Cache Service
 * Generic get/set/invalidate wrapper plus a getOrSet helper, used by
 * analytics.service.js (dashboard cache) and vendor.service.js
 * (vendor list/detail cache) so query-heavy read paths don't hit
 * MongoDB on every request.
 */

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

class CacheService {
  async get(key) {
    const raw = await redisClient.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redisClient.set(key, serialized, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, serialized);
    }
  }

  async del(key) {
    await redisClient.del(key);
  }

  /** Deletes every key matching a prefix, e.g. "vendor:*" after a vendor write. */
  async delByPattern(pattern) {
    const stream = redisClient.scanStream({ match: pattern, count: 100 });

    const keysToDelete = [];
    for await (const keys of stream) {
      keysToDelete.push(...keys);
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
  async getOrSet(key, fetcher, ttlSeconds = DEFAULT_TTL_SECONDS) {
    const cached = await this.get(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}

const cacheService = new CacheService();

/** Common cache key builders so producers/invalidators never drift apart. */
const CacheKeys = {
  vendorList: (queryHash) => `vendor:list:${queryHash}`,
  vendorDetail: (id) => `vendor:detail:${id}`,
  dashboardSummary: () => "analytics:dashboard:summary",
  vendorRankings: (limit) => `analytics:vendor-rankings:${limit}`,
  budgetUtilization: (fiscalYear) => `analytics:budget-utilization:${fiscalYear}`,
};

module.exports = {
  CacheService,
  cacheService,
  CacheKeys,
};