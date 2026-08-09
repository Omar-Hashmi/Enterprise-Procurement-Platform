// File: budget.validation.js

const Joi = require("joi");
const { AppError } = require("../utils/AppError");

/**
 * Validation Layer — request-shape validation for the Budget module.
 */

const validate = (schema, target = "body") => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return next(new AppError(`Validation failed: ${message}`, 400));
    }

    req[target] = value;
    next();
  };
};

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('"{{#label}}" must be a valid id');

// ---- Budget CRUD ----

const createBudgetSchema = Joi.object({
  department: objectId.required(),
  project: objectId.optional(),
  fiscalYear: Joi.number().integer().min(2000).max(2100).required(),
  period: Joi.string().valid("monthly", "quarterly", "annual").required(),
  allocatedAmount: Joi.number().positive().required(),
  purchaseLimit: Joi.number().positive().required(),
  warningThresholdPercent: Joi.number().min(1).max(100).optional(),
});

const updateBudgetSchema = Joi.object({
  period: Joi.string().valid("monthly", "quarterly", "annual").optional(),
  purchaseLimit: Joi.number().positive().optional(),
  warningThresholdPercent: Joi.number().min(1).max(100).optional(),
}).min(1);

const budgetIdParamSchema = Joi.object({
  id: objectId.required(),
});

const listBudgetsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  department: objectId.optional(),
  project: objectId.optional(),
  fiscalYear: Joi.number().integer().min(2000).max(2100).optional(),
  status: Joi.string().valid("active", "exhausted", "closed").optional(),
});

// ---- Ledger operations ----

const referenceTypeSchema = Joi.string().valid("PurchaseOrder", "RFQ", "Manual");

const topUpBudgetSchema = Joi.object({
  amount: Joi.number().positive().required(),
  note: Joi.string().max(1000).optional(),
});

const reserveFundsSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reference: objectId.optional(),
  referenceType: referenceTypeSchema.optional(),
  note: Joi.string().max(1000).optional(),
});

const releaseReservationSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reference: objectId.optional(),
  referenceType: referenceTypeSchema.optional(),
  note: Joi.string().max(1000).optional(),
});

const recordExpenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reference: objectId.optional(),
  referenceType: referenceTypeSchema.optional(),
  note: Joi.string().max(1000).optional(),
  releaseReservedAmount: Joi.boolean().optional(),
});

const adjustBudgetSchema = Joi.object({
  amount: Joi.number().invalid(0).required(),
  note: Joi.string().min(5).max(1000).required(),
});

const checkPurchaseQuerySchema = Joi.object({
  amount: Joi.number().positive().required(),
});

// ---- Exported middleware (what routes actually import) ----

const validateCreateBudget = validate(createBudgetSchema, "body");
const validateUpdateBudget = validate(updateBudgetSchema, "body");
const validateBudgetIdParam = validate(budgetIdParamSchema, "params");
const validateListBudgetsQuery = validate(listBudgetsQuerySchema, "query");
const validateTopUpBudget = validate(topUpBudgetSchema, "body");
const validateReserveFunds = validate(reserveFundsSchema, "body");
const validateReleaseReservation = validate(releaseReservationSchema, "body");
const validateRecordExpense = validate(recordExpenseSchema, "body");
const validateAdjustBudget = validate(adjustBudgetSchema, "body");
const validateCheckPurchaseQuery = validate(checkPurchaseQuerySchema, "query");

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  listBudgetsQuerySchema,
  topUpBudgetSchema,
  reserveFundsSchema,
  releaseReservationSchema,
  recordExpenseSchema,
  adjustBudgetSchema,
  checkPurchaseQuerySchema,
  validateCreateBudget,
  validateUpdateBudget,
  validateBudgetIdParam,
  validateListBudgetsQuery,
  validateTopUpBudget,
  validateReserveFunds,
  validateReleaseReservation,
  validateRecordExpense,
  validateAdjustBudget,
  validateCheckPurchaseQuery,
};