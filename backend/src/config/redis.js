const Redis = require("ioredis");

/**
 * Redis Connection
 * (Redis Caching & Email Queues)
 *
 * Single shared client reused by cache.service.js (dashboard/vendor
 * caching) and queues/email.queue.js (queue-based email processing).
 */

const redisOptions = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
};

const redisClient = new Redis(redisOptions);

redisClient.on("connect", () => {
  // eslint-disable-next-line no-console
  console.log("[redis] connected");
});

redisClient.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("[redis] connection error:", err.message);
});

/** Call once during server startup if you want an explicit readiness check. */
const connectRedis = async () => {
  if (redisClient.status === "ready") return;
  await redisClient.connect();
};

/** Call during graceful shutdown. */
const disconnectRedis = async () => {
  await redisClient.quit();
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};