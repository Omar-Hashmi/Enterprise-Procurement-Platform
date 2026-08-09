import Redis, { RedisOptions } from "ioredis";

/**
 * Redis Connection
 *(Redis Caching & Email Queues)
 *
 * Single shared client reused by cache.service.ts (dashboard/vendor
 * caching) and queues/email.queue.ts (queue-based email processing).
 */

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (attempt: number) => Math.min(attempt * 200, 2000),
};

export const redisClient = new Redis(redisOptions);

redisClient.on("connect", () => {
  // eslint-disable-next-line no-console
  console.log("[redis] connected");
});

redisClient.on("error", (err: Error) => {
  // eslint-disable-next-line no-console
  console.error("[redis] connection error:", err.message);
});

/** Call once during server startup if you want an explicit readiness check. */
export const connectRedis = async (): Promise<void> => {
  if (redisClient.status === "ready") return;
  await redisClient.connect();
};

/** Call during graceful shutdown. */
export const disconnectRedis = async (): Promise<void> => {
  await redisClient.quit();
};
