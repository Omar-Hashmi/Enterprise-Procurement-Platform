import cron from "node-cron";
import { contractService } from "../services/contract.service.js";
import { emailService } from "../services/email.service.js";
import { enqueueEmail } from "../queues/email.queue.js";
import { isReminderDue } from "../utils/contractReminder.js";

/**
 * Contract Renewal Reminder Job
 * Owner: Developer 2 (Contract Management)
 *
 * Runs daily, finds contracts with a due-and-unsent renewal reminder,
 * queues a notification email per contract, and marks the reminder
 * sent so it doesn't fire again tomorrow.
 */

const isPopulatedVendor = (vendor) => {
  return typeof vendor === "object" && vendor !== null;
};

export const runContractReminderCheck = async () => {
  const contracts = await contractService.getDueReminders();
  let processed = 0;
  let failed = 0;

  for (const contract of contracts) {
    const dueReminders = contract.renewalReminders.filter((r) => isReminderDue(r));

    for (const reminder of dueReminders) {
      try {
        const vendorEmail = isPopulatedVendor(contract.vendor)
          ? contract.vendor.companyInfo?.contactPerson?.email
          : undefined;
        const vendorName = isPopulatedVendor(contract.vendor)
          ? contract.vendor.companyName ?? "Vendor"
          : "Vendor";

        if (vendorEmail) {
          await enqueueEmail({
            to: vendorEmail,
            subject: `Contract Renewal Reminder — ${contract.contractNumber}`,
            html: emailService.buildContractRenewalReminderEmail(contract.title, contract.endDate),
          });
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            `[contractReminder.job] contract ${contract.contractNumber} has no resolvable vendor email, skipping send but marking reminder sent`
          );
        }

        await contractService.markReminderSent(
          contract._id.toString(),
          reminder._id.toString()
        );
        processed += 1;
      } catch (err) {
        failed += 1;
        // eslint-disable-next-line no-console
        console.error(
          `[contractReminder.job] failed processing reminder for contract ${contract.contractNumber}:`,
          err.message
        );
      }
    }
  }

  return { processed, failed };
};

let scheduledTask = null;

/** Schedules the daily check. Call once at server startup. Default: 07:00 every day. */
export const scheduleContractReminderJob = (cronExpression = "0 7 * * *") => {
  if (scheduledTask) return;

  scheduledTask = cron.schedule(cronExpression, () => {
    void runContractReminderCheck().then(({ processed, failed }) => {
      // eslint-disable-next-line no-console
      console.log(`[contractReminder.job] run complete — processed: ${processed}, failed: ${failed}`);
    });
  });
};

export const stopContractReminderJob = () => {
  scheduledTask?.stop();
  scheduledTask = null;
};