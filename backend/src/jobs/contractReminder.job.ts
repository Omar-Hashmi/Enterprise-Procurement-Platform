import cron, { ScheduledTask } from "node-cron";
import { contractService } from "../services/contract.service";
import { emailService } from "../services/email.service";
import { enqueueEmail } from "../queues/email.queue";
import { IContract, IRenewalReminder } from "../models/Contract";
import { isReminderDue } from "../utils/contractReminder";

/**
 * Contract Renewal Reminder Job
 * Owner: Developer 2 (Contract Management)
 *
 * Runs daily, finds contracts with a due-and-unsent renewal reminder,
 * queues a notification email per contract, and marks the reminder
 * sent so it doesn't fire again tomorrow.
 */

const isPopulatedVendor = (
  vendor: IContract["vendor"]
): vendor is IContract["vendor"] & { companyInfo?: { contactPerson?: { email?: string } }; companyName?: string } => {
  return typeof vendor === "object" && vendor !== null;
};

export const runContractReminderCheck = async (): Promise<{ processed: number; failed: number }> => {
  const contracts = await contractService.getDueReminders();
  let processed = 0;
  let failed = 0;

  for (const contract of contracts) {
    const dueReminders = contract.renewalReminders.filter((r: IRenewalReminder) => isReminderDue(r));

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
          (contract._id as unknown as { toString(): string }).toString(),
          (reminder._id as unknown as { toString(): string }).toString()
        );
        processed += 1;
      } catch (err) {
        failed += 1;
        // eslint-disable-next-line no-console
        console.error(
          `[contractReminder.job] failed processing reminder for contract ${contract.contractNumber}:`,
          (err as Error).message
        );
      }
    }
  }

  return { processed, failed };
};

let scheduledTask: ScheduledTask | null = null;

/** Schedules the daily check. Call once at server startup. Default: 07:00 every day. */
export const scheduleContractReminderJob = (cronExpression = "0 7 * * *"): void => {
  if (scheduledTask) return;

  scheduledTask = cron.schedule(cronExpression, () => {
    void runContractReminderCheck().then(({ processed, failed }) => {
      // eslint-disable-next-line no-console
      console.log(`[contractReminder.job] run complete — processed: ${processed}, failed: ${failed}`);
    });
  });
};

export const stopContractReminderJob = (): void => {
  scheduledTask?.stop();
  scheduledTask = null;
};
