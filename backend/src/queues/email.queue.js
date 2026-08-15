const { redisClient } = require("../config/redis");
const { emailService } = require("../services/email.service");

const QUEUE_KEY = "queue:email";
const DEAD_LETTER_KEY = "queue:email:failed";
const MAX_ATTEMPTS = 3;
const BLOCK_TIMEOUT_SECONDS = 5;

const enqueueEmail = async (payload) => {
  const job = { payload, attempts: 0, enqueuedAt: new Date().toISOString() };
  await redisClient.lpush(QUEUE_KEY, JSON.stringify(job));
};

const processJob = async (job) => {
  try {
    await emailService.sendEmail(job.payload);
  } catch (err) {
    const nextAttempts = job.attempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      await redisClient.lpush(
        DEAD_LETTER_KEY,
        JSON.stringify({ ...job, attempts: nextAttempts, lastError: err.message })
      );
      console.error(
        `[email.queue] job failed after ${nextAttempts} attempts, moved to dead letter:`,
        err.message
      );
      return;
    }
    console.warn(`[email.queue] job failed (attempt ${nextAttempts}), re-queuing:`, err.message);
    await redisClient.lpush(QUEUE_KEY, JSON.stringify({ ...job, attempts: nextAttempts }));
  }
};

let workerRunning = false;

const startEmailWorker = () => {
  if (workerRunning) return;
  workerRunning = true;

  const loop = async () => {
    while (workerRunning) {
      try {
        const result = await redisClient.brpop(QUEUE_KEY, BLOCK_TIMEOUT_SECONDS);
        if (!result) continue;

        const [, raw] = result;
        const job = JSON.parse(raw);
        await processJob(job);
      } catch (err) {
        console.error("[email.queue] worker loop error:", err.message);
      }
    }
  };

  void loop();
};

const stopEmailWorker = () => {
  workerRunning = false;
};

const getQueueDepth = async () => {
  const [pending, deadLetter] = await Promise.all([
    redisClient.llen(QUEUE_KEY),
    redisClient.llen(DEAD_LETTER_KEY),
  ]);
  return { pending, deadLetter };
};

module.exports = {
  enqueueEmail,
  startEmailWorker,
  stopEmailWorker,
  getQueueDepth,
};
