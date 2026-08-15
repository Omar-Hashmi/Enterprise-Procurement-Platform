// File: rfq.validation.js

const Joi = require("joi");
const { AppError } = require("../utils/AppError");

/**
 * Validation Layer — request-shape validation for the RFQ module.
 * Mirrors validations/vendor.validation.js: schema + middleware factory
 * kept together, no dependency on a shared middleware/validate.js.
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

// ---- RFQ CRUD ----

const rfqItemSchema = Joi.object({
  description: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  unit: Joi.string().required(),
  specifications: Joi.string().optional(),
});

const createRFQSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional(),
  purchaseRequisition: objectId.optional(),
  department: objectId.required(),
  items: Joi.array().items(rfqItemSchema).min(1).required(),
  submissionDeadline: Joi.date().iso().greater("now").required(),
});

const updateRFQSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(2000).optional(),
  items: Joi.array().items(rfqItemSchema).min(1).optional(),
  submissionDeadline: Joi.date().iso().greater("now").optional(),
}).min(1);

const rfqIdParamSchema = Joi.object({
  id: objectId.required(),
});

const listRFQsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string()
    .valid(
      "draft",
      "published",
      "quotes_received",
      "under_evaluation",
      "vendor_selected",
      "closed",
      "cancelled"
    )
    .optional(),
  department: objectId.optional(),
  search: Joi.string().max(100).optional(),
});

// ---- Vendor invitations ----

const inviteVendorsSchema = Joi.object({
  vendorIds: Joi.array().items(objectId).min(1).required(),
});

// ---- Quotations ----

const quotationItemSchema = Joi.object({
  rfqItemId: objectId.required(),
  unitPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
  deliveryDays: Joi.number().integer().min(0).required(),
  remarks: Joi.string().max(500).optional(),
});

const submitQuotationSchema = Joi.object({
  vendorId: objectId.required(),
  items: Joi.array().items(quotationItemSchema).min(1).required(),
  paymentTerms: Joi.string().max(500).optional(),
  deliveryTerms: Joi.string().max(500).optional(),
  validUntil: Joi.date().iso().greater("now").optional(),
  attachments: Joi.array().items(Joi.string().uri()).optional(),
});

const evaluateQuotationSchema = Joi.object({
  status: Joi.string().valid("shortlisted", "rejected").required(),
  technicalScore: Joi.number().min(0).max(100).optional(),
  evaluationNotes: Joi.string().max(2000).optional(),
});

const quotationIdParamSchema = Joi.object({
  id: objectId.required(),
  quotationId: objectId.required(),
});

const selectVendorSchema = Joi.object({
  justification: Joi.string().max(2000).optional(),
});

// ---- Exported middleware (what routes actually import) ----

const validateCreateRFQ = validate(createRFQSchema, "body");
const validateUpdateRFQ = validate(updateRFQSchema, "body");
const validateRFQIdParam = validate(rfqIdParamSchema, "params");
const validateListRFQsQuery = validate(listRFQsQuerySchema, "query");
const validateInviteVendors = validate(inviteVendorsSchema, "body");
const validateSubmitQuotation = validate(submitQuotationSchema, "body");
const validateEvaluateQuotation = validate(evaluateQuotationSchema, "body");
const validateQuotationIdParam = validate(quotationIdParamSchema, "params");
const validateSelectVendor = validate(selectVendorSchema, "body");

module.exports = {
  createRFQSchema,
  updateRFQSchema,
  rfqIdParamSchema,
  listRFQsQuerySchema,
  inviteVendorsSchema,
  submitQuotationSchema,
  evaluateQuotationSchema,
  quotationIdParamSchema,
  selectVendorSchema,
  validateCreateRFQ,
  validateUpdateRFQ,
  validateRFQIdParam,
  validateListRFQsQuery,
  validateInviteVendors,
  validateSubmitQuotation,
  validateEvaluateQuotation,
  validateQuotationIdParam,
  validateSelectVendor,
};