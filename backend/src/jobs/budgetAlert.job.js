import cron from "node-cron";
import { budgetService } from "../services/budget.service.js";
import { emailService } from "../services/email.service.js";
import { enqueueEmail } from "../queues/email.queue.js";
import { calculateUtilizationPercent } from "../utils/budgetCalculator.js";

/**
 * Budget Alert Job
 * Runs daily, finds budgets at or beyond their configured warning
 * threshold, and queues one alert email per over-threshold budget.
 *
 * Note: the current Budget schema has no "lastAlertedAt" field, so
 * this will re-alert every run while a budget stays over threshold.
 * If that's too noisy in practice, add a timestamp field to Budget
 * and check it here before queuing another email.
 */

const isPopulatedDepartment = (department) => {
  return typeof department === "object" && department !== null;
};

export const runBudgetAlertCheck = async () => {
  const budgets = await budgetService.getBudgetsOverThreshold();
  let alerted = 0;

  for (const budget of budgets) {
    const utilization = calculateUtilizationPercent(budget);

    const departmentName = isPopulatedDepartment(budget.department)
      ? budget.department.name ?? "Department"
      : "Department";
    const departmentEmail = isPopulatedDepartment(budget.department)
      ? budget.department.managerEmail
      : undefined;

    if (!departmentEmail) {
      // eslint-disable-next-line no-console
      console.warn(
        `[budgetAlert.job] budget ${budget._id} has no resolvable department manager email, skipping send`
      );
      continue;
    }

    try {
      await enqueueEmail({
        to: departmentEmail,
        subject: `Budget Warning — ${departmentName} at ${utilization.toFixed(1)}% utilization`,
        html: emailService.buildBudgetWarningEmail(departmentName, utilization),
      });
      alerted += 1;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[budgetAlert.job] failed to queue alert for budget ${budget._id}:`, err.message);
    }
  }

  return { alerted };
};

let scheduledTask = null;

/** Schedules the daily check. Call once at server startup. Default: 08:00 every day. */
export const scheduleBudgetAlertJob = (cronExpression = "0 8 * * *") => {
  if (scheduledTask) return;

  scheduledTask = cron.schedule(cronExpression, () => {
    void runBudgetAlertCheck().then(({ alerted }) => {
      // eslint-disable-next-line no-console
      console.log(`[budgetAlert.job] run complete — alerted: ${alerted} budgets`);
    });
  });
};

export const stopBudgetAlertJob = () => {
  scheduledTask?.stop();
  scheduledTask = null;
};