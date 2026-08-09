// File: contract.validation.js

const Joi = require("joi");
const { AppError } = require("../utils/AppError");

/**
 * Validation Layer — request-shape validation for the Contract module.
 * Mirrors validations/vendor.validation.js, rfq.validation.js, budget.validation.js.
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

// ---- Contract CRUD ----

const createContractSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  vendor: objectId.required(),
  department: objectId.required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required(),
  autoRenew: Joi.boolean().optional(),
  renewalNoticeDays: Joi.number().integer().min(1).max(365).optional(),
  value: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().optional(),
  paymentTerms: Joi.string().max(1000).optional(),
});

const updateContractSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  autoRenew: Joi.boolean().optional(),
  renewalNoticeDays: Joi.number().integer().min(1).max(365).optional(),
  value: Joi.number().positive().optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  paymentTerms: Joi.string().max(1000).optional(),
}).min(1);

const contractIdParamSchema = Joi.object({
  id: objectId.required(),
});

const listContractsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string()
    .valid("draft", "active", "expiring_soon", "expired", "terminated")
    .optional(),
  vendor: objectId.optional(),
  department: objectId.optional(),
  search: Joi.string().max(100).optional(),
});

const expiringContractsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).optional(),
});

// ---- Lifecycle actions ----

const terminateContractSchema = Joi.object({
  reason: Joi.string().min(5).max(1000).required(),
});

const renewContractSchema = Joi.object({
  newEndDate: Joi.date().iso().required(),
});

// ---- Attachments & compliance ----

const addAttachmentSchema = Joi.object({
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
});

const addComplianceDocumentSchema = Joi.object({
  name: Joi.string().required(),
  documentUrl: Joi.string().uri().required(),
});

const complianceDocumentParamSchema = Joi.object({
  id: objectId.required(),
  documentId: objectId.required(),
});

const reminderParamSchema = Joi.object({
  id: objectId.required(),
  reminderId: objectId.required(),
});

// ---- Exported middleware (what routes actually import) ----

const validateCreateContract = validate(createContractSchema, "body");
const validateUpdateContract = validate(updateContractSchema, "body");
const validateContractIdParam = validate(contractIdParamSchema, "params");
const validateListContractsQuery = validate(listContractsQuerySchema, "query");
const validateExpiringContractsQuery = validate(expiringContractsQuerySchema, "query");
const validateTerminateContract = validate(terminateContractSchema, "body");
const validateRenewContract = validate(renewContractSchema, "body");
const validateAddAttachment = validate(addAttachmentSchema, "body");
const validateAddComplianceDocument = validate(addComplianceDocumentSchema, "body");
const validateComplianceDocumentParam = validate(complianceDocumentParamSchema, "params");
const validateReminderParam = validate(reminderParamSchema, "params");

module.exports = {
  createContractSchema,
  updateContractSchema,
  contractIdParamSchema,
  listContractsQuerySchema,
  expiringContractsQuerySchema,
  terminateContractSchema,
  renewContractSchema,
  addAttachmentSchema,
  addComplianceDocumentSchema,
  complianceDocumentParamSchema,
  reminderParamSchema,
  validateCreateContract,
  validateUpdateContract,
  validateContractIdParam,
  validateListContractsQuery,
  validateExpiringContractsQuery,
  validateTerminateContract,
  validateRenewContract,
  validateAddAttachment,
  validateAddComplianceDocument,
  validateComplianceDocumentParam,
  validateReminderParam,
};