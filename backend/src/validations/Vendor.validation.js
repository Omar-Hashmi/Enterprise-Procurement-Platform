// File: vendor.validation.js

const Joi = require("joi");
const { AppError } = require("../utils/AppError");

/**
 * Validation Layer — request-shape validation for Vendor Management.
 * Kept self-contained (schema + middleware factory in one file)
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

// ---- Shared sub-schemas ----

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().optional().allow("", null),
  country: Joi.string().required(),
  postalCode: Joi.string().optional().allow("", null),
});

const contactPersonSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ tlds: false }).required(),
  phone: Joi.string().required(),
  designation: Joi.string().optional().allow("", null),
});

const companyInfoSchema = Joi.object({
  registrationNumber: Joi.string().required(),
  website: Joi.string().uri().optional().allow("", null),
  industry: Joi.string().optional().allow("", null),
  address: addressSchema.required(),
  contactPerson: contactPersonSchema.required(),
});

const taxInfoSchema = Joi.object({
  taxId: Joi.string().required(),
  vatNumber: Joi.string().optional().allow("", null),
  taxDocumentUrl: Joi.string().uri().optional().allow("", null),
});

// ---- Vendor CRUD ----

const createVendorSchema = Joi.object({
  companyName: Joi.string().min(2).max(200).required(),
  companyInfo: companyInfoSchema.required(),
  taxInfo: taxInfoSchema.required(),
  categories: Joi.array().items(Joi.alternatives().try(objectId, Joi.string())).optional(),
});

const updateVendorSchema = Joi.object({
  companyName: Joi.string().min(2).max(200).optional(),
  companyInfo: companyInfoSchema.optional(),
  taxInfo: taxInfoSchema.optional(),
  categories: Joi.array().items(Joi.alternatives().try(objectId, Joi.string())).optional(),
}).min(1);

const updateVendorStatusSchema = Joi.object({
  status: Joi.string().valid("active", "suspended", "blacklisted").required(),
  reason: Joi.string().when("status", {
    is: "blacklisted",
    then: Joi.string().min(5).required(),
    otherwise: Joi.string().optional().allow("", null),
  }),
});

const vendorIdParamSchema = Joi.object({
  id: objectId.required(),
});

const listVendorsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid("pending", "active", "suspended", "blacklisted").optional(),
  category: Joi.alternatives().try(objectId, Joi.string()).optional(),
  search: Joi.string().max(100).optional().allow("", null),
});

// ---- Ratings ----

const rateVendorSchema = Joi.object({
  deliveryScore: Joi.number().min(1).max(5).required(),
  qualityScore: Joi.number().min(1).max(5).required(),
  costEfficiencyScore: Joi.number().min(1).max(5).required(),
  complianceScore: Joi.number().min(1).max(5).required(),
  comments: Joi.string().max(1000).optional().allow("", null),
});

// ---- Certifications ----

const addCertificationSchema = Joi.object({
  name: Joi.string().required(),
  issuingAuthority: Joi.string().required(),
  certificateNumber: Joi.string().required(),
  issueDate: Joi.date().iso().required(),
  expiryDate: Joi.date().iso().greater(Joi.ref("issueDate")).optional(),
  documentUrl: Joi.string().uri().required(),
});

// ---- Bank Accounts ----

const addBankAccountSchema = Joi.object({
  bankName: Joi.string().required(),
  accountTitle: Joi.string().required(),
  accountNumber: Joi.string().required(),
  iban: Joi.string().optional().allow("", null),
  swiftCode: Joi.string().optional().allow("", null),
  branchCode: Joi.string().optional().allow("", null),
  currency: Joi.string().length(3).uppercase().optional(),
  isPrimary: Joi.boolean().optional(),
});

const bankAccountIdParamSchema = Joi.object({
  id: objectId.required(),
  accountId: objectId.required(),
});

// ---- Vendor Categories ----

const createVendorCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow("", null),
});

// ---- Exported middleware (what routes actually import) ----

const validateCreateVendor = validate(createVendorSchema, "body");
const validateUpdateVendor = validate(updateVendorSchema, "body");
const validateUpdateVendorStatus = validate(updateVendorStatusSchema, "body");
const validateVendorIdParam = validate(vendorIdParamSchema, "params");
const validateListVendorsQuery = validate(listVendorsQuerySchema, "query");
const validateRateVendor = validate(rateVendorSchema, "body");
const validateAddCertification = validate(addCertificationSchema, "body");
const validateAddBankAccount = validate(addBankAccountSchema, "body");
const validateUpdateBankAccount = validate(addBankAccountSchema, "body");
const validateBankAccountIdParam = validate(bankAccountIdParamSchema, "params");
const validateCreateVendorCategory = validate(createVendorCategorySchema, "body");

module.exports = {
  createVendorSchema,
  updateVendorSchema,
  updateVendorStatusSchema,
  vendorIdParamSchema,
  listVendorsQuerySchema,
  rateVendorSchema,
  addCertificationSchema,
  addBankAccountSchema,
  bankAccountIdParamSchema,
  createVendorCategorySchema,
  validateCreateVendor,
  validateUpdateVendor,
  validateUpdateVendorStatus,
  validateVendorIdParam,
  validateListVendorsQuery,
  validateRateVendor,
  validateAddCertification,
  validateAddBankAccount,
  validateUpdateBankAccount,
  validateBankAccountIdParam,
  validateCreateVendorCategory,
};
