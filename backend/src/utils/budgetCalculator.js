// File: budgetCalculator.js

/**
 * Budget Calculator
 * Owner: Developer 2 (Budget Management)
 *
 * Pure functions only — no I/O, no Mongoose. Kept separate from
 * budget.service.js so the arithmetic can be unit tested without a
 * database, and reused by analytics.service.js for utilization
 * reporting without duplicating the formulas.
 */

const calculateRemaining = ({
  allocatedAmount,
  spentAmount,
  reservedAmount,
}) => {
  return allocatedAmount - spentAmount - reservedAmount;
};

const calculateUtilizationPercent = ({
  allocatedAmount,
  spentAmount,
  reservedAmount,
}) => {
  if (allocatedAmount === 0) return 0;
  return Number((((spentAmount + reservedAmount) / allocatedAmount) * 100).toFixed(2));
};

const isOverThreshold = (amounts, warningThresholdPercent) => {
  return calculateUtilizationPercent(amounts) >= warningThresholdPercent;
};

/** Shared by budget.service.checkPurchaseAllowed and any other module validating a spend against a budget. */
const evaluatePurchase = (input) => {
  if (input.status !== "active") {
    return { allowed: false, reason: `Budget is ${input.status}.`, requiresEscalation: false };
  }

  const remaining = calculateRemaining(input);
  if (input.amount > remaining) {
    return { allowed: false, reason: "Amount exceeds remaining budget.", requiresEscalation: false };
  }

  if (input.amount > input.purchaseLimit) {
    return {
      allowed: false,
      reason: "Amount exceeds the single-purchase limit for this budget.",
      requiresEscalation: true,
    };
  }

  return { allowed: true, requiresEscalation: false };
};

/** Derives status the same way the model's pre-save hook does, for use outside a hydrated document. */
const deriveBudgetStatus = (amounts, currentStatus) => {
  if (currentStatus === "closed") return "closed";
  return calculateRemaining(amounts) <= 0 ? "exhausted" : "active";
};

module.exports = {
  calculateRemaining,
  calculateUtilizationPercent,
  isOverThreshold,
  evaluatePurchase,
  deriveBudgetStatus,
};