import { redisClient } from "../config/redis";
import { emailService, EmailPayload } from "../services/email.service";

/**
 * Email Queue
 *
 * A lightweight Redis-list queue: enqueueEmail() pushes a JSON job,
 * startEmailWorker() runs a blocking-pop loop that processes jobs one
 * at a time and retries a failed job a bounded number of times before
 * moving it to a dead-letter list for manual inspection.
 */

const QUEUE_KEY = "queue:email";
const DEAD_LETTER_KEY = "queue:email:failed";
const MAX_ATTEMPTS = 3;
const BLOCK_TIMEOUT_SECONDS = 5;

interface EmailJob {
  payload: EmailPayload;
  attempts: number;
  enqueuedAt: string;
}

export const enqueueEmail = async (payload: EmailPayload): Promise<void> => {
  const job: EmailJob = { payload, attempts: 0, enqueuedAt: new Date().toISOString() };
  await redisClient.lpush(QUEUE_KEY, JSON.stringify(job));
};

const processJob = async (job: EmailJob): Promise<void> => {
  try {
    await emailService.sendEmail(job.payload);
  } catch (err) {
    const nextAttempts = job.attempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      await redisClient.lpush(
        DEAD_LETTER_KEY,
        JSON.stringify({ ...job, attempts: nextAttempts, lastError: (err as Error).message })
      );
      // eslint-disable-next-line no-console
      console.error(
        `[email.queue] job failed after ${nextAttempts} attempts, moved to dead letter:`,
        (err as Error).message
      );
      return;
    }
    // eslint-disable-next-line no-console
    console.warn(`[email.queue] job failed (attempt ${nextAttempts}), re-queuing:`, (err as Error).message);
    await redisClient.lpush(QUEUE_KEY, JSON.stringify({ ...job, attempts: nextAttempts }));
  }
};

let workerRunning = false;

/**
 * Starts a blocking-pop worker loop. Call once at server startup
 * (e.g. from server.ts). Safe to call multiple times — subsequent
 * calls are no-ops while a worker is already running.
 */
export const startEmailWorker = (): void => {
  if (workerRunning) return;
  workerRunning = true;

  const loop = async (): Promise<void> => {
    while (workerRunning) {
      try {
        const result = await redisClient.brpop(QUEUE_KEY, BLOCK_TIMEOUT_SECONDS);
        if (!result) continue; // timed out waiting, loop again

        const [, raw] = result;
        const job = JSON.parse(raw) as EmailJob;
        await processJob(job);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[email.queue] worker loop error:", (err as Error).message);
      }
    }
  };

  void loop();
};

export const stopEmailWorker = (): void => {
  workerRunning = false;
};

export const getQueueDepth = async (): Promise<{ pending: number; deadLetter: number }> => {
  const [pending, deadLetter] = await Promise.all([
    redisClient.llen(QUEUE_KEY),
    redisClient.llen(DEAD_LETTER_KEY),
  ]);
  return { pending, deadLetter };
};
