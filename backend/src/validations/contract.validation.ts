import Joi from "joi";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../utils/AppError";

/**
 * Validation Layer — request-shape validation for the Contract module.
 * Mirrors validations/vendor.validation.ts, rfq.validation.ts, budget.validation.ts.
 */

type ValidationTarget = "body" | "query" | "params";

const validate = (schema: Joi.ObjectSchema, target: ValidationTarget = "body"): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
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

export const createContractSchema = Joi.object({
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

export const updateContractSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  autoRenew: Joi.boolean().optional(),
  renewalNoticeDays: Joi.number().integer().min(1).max(365).optional(),
  value: Joi.number().positive().optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  paymentTerms: Joi.string().max(1000).optional(),
}).min(1);

export const contractIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const listContractsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string()
    .valid("draft", "active", "expiring_soon", "expired", "terminated")
    .optional(),
  vendor: objectId.optional(),
  department: objectId.optional(),
  search: Joi.string().max(100).optional(),
});

export const expiringContractsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).optional(),
});

// ---- Lifecycle actions ----

export const terminateContractSchema = Joi.object({
  reason: Joi.string().min(5).max(1000).required(),
});

export const renewContractSchema = Joi.object({
  newEndDate: Joi.date().iso().required(),
});

// ---- Attachments & compliance ----

export const addAttachmentSchema = Joi.object({
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
});

export const addComplianceDocumentSchema = Joi.object({
  name: Joi.string().required(),
  documentUrl: Joi.string().uri().required(),
});

export const complianceDocumentParamSchema = Joi.object({
  id: objectId.required(),
  documentId: objectId.required(),
});

export const reminderParamSchema = Joi.object({
  id: objectId.required(),
  reminderId: objectId.required(),
});

// ---- Exported middleware (what routes actually import) ----

export const validateCreateContract = validate(createContractSchema, "body");
export const validateUpdateContract = validate(updateContractSchema, "body");
export const validateContractIdParam = validate(contractIdParamSchema, "params");
export const validateListContractsQuery = validate(listContractsQuerySchema, "query");
export const validateExpiringContractsQuery = validate(expiringContractsQuerySchema, "query");
export const validateTerminateContract = validate(terminateContractSchema, "body");
export const validateRenewContract = validate(renewContractSchema, "body");
export const validateAddAttachment = validate(addAttachmentSchema, "body");
export const validateAddComplianceDocument = validate(addComplianceDocumentSchema, "body");
export const validateComplianceDocumentParam = validate(complianceDocumentParamSchema, "params");
export const validateReminderParam = validate(reminderParamSchema, "params");
