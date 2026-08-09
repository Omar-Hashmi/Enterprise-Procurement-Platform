/**
 * Contract Reminder Calculator
 *
 * Pure date-math functions for renewal reminders and expiry status.
 * jobs/contractReminder.job.ts uses these to decide what's due;
 * contract.repository.ts uses calculateReminderDate when scheduling
 * a fresh reminder on create/renew.
 */

export type DerivedContractStatus = "active" | "expiring_soon" | "expired";

export const calculateReminderDate = (endDate: Date, renewalNoticeDays: number): Date => {
  const reminderDate = new Date(endDate);
  reminderDate.setDate(reminderDate.getDate() - renewalNoticeDays);
  return reminderDate;
};

export const daysUntilExpiry = (endDate: Date, asOf: Date = new Date()): number => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((endDate.getTime() - asOf.getTime()) / msPerDay);
};

export const isReminderDue = (
  reminder: { reminderDate: Date; sent: boolean },
  asOf: Date = new Date()
): boolean => {
  return !reminder.sent && reminder.reminderDate <= asOf;
};

/** Mirrors the model's pre-save derivation, for use where a hydrated document isn't available. */
export const deriveContractStatus = (
  startDate: Date,
  endDate: Date,
  renewalNoticeDays: number,
  asOf: Date = new Date()
): DerivedContractStatus => {
  const noticeWindowStart = calculateReminderDate(endDate, renewalNoticeDays);

  if (asOf > endDate) return "expired";
  if (asOf >= noticeWindowStart) return "expiring_soon";
  return "active";
};

export const isExpiringWithin = (endDate: Date, days: number, asOf: Date = new Date()): boolean => {
  return daysUntilExpiry(endDate, asOf) <= days;
};
