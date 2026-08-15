// File: contractReminderCalculator.js

/**
 * Contract Reminder Calculator)
 *
 * Pure date-math functions for renewal reminders and expiry status.
 * jobs/contractReminder.job.js uses these to decide what's due;
 * contract.repository.js uses calculateReminderDate when scheduling
 * a fresh reminder on create/renew.
 */

const calculateReminderDate = (endDate, renewalNoticeDays) => {
  const reminderDate = new Date(endDate);
  reminderDate.setDate(reminderDate.getDate() - renewalNoticeDays);
  return reminderDate;
};

const daysUntilExpiry = (endDate, asOf = new Date()) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((endDate.getTime() - asOf.getTime()) / msPerDay);
};

const isReminderDue = (reminder, asOf = new Date()) => {
  return !reminder.sent && reminder.reminderDate <= asOf;
};

/** Mirrors the model's pre-save derivation, for use where a hydrated document isn't available. */
const deriveContractStatus = (
  startDate,
  endDate,
  renewalNoticeDays,
  asOf = new Date()
) => {
  const noticeWindowStart = calculateReminderDate(endDate, renewalNoticeDays);

  if (asOf > endDate) return "expired";
  if (asOf >= noticeWindowStart) return "expiring_soon";
  return "active";
};

const isExpiringWithin = (endDate, days, asOf = new Date()) => {
  return daysUntilExpiry(endDate, asOf) <= days;
};

module.exports = {
  calculateReminderDate,
  daysUntilExpiry,
  isReminderDue,
  deriveContractStatus,
  isExpiringWithin,
};