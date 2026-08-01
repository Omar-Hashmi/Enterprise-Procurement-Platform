import * as Joi from "joi";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../utils/AppError";

/**
 * Validation Layer — request-shape validation for Vendor Management.
 * Kept self-contained (schema + middleware factory in one file) so this
 * module has no dependency on a shared `middleware/validate.ts`, which
 * isn't part of Developer 2's ownership boundary.
 */

type ValidationTarget = "body" | "query" | "params";

const validate = (schema: Joi.ObjectSchema, target: ValidationTarget = "body"): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d: { message: string }) => d.message).join("; ");
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
  state: Joi.string().optional(),
  country: Joi.string().required(),
  postalCode: Joi.string().optional(),
});

const contactPersonSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ tlds: false }).required(),
  phone: Joi.string().required(),
  designation: Joi.string().optional(),
});

const companyInfoSchema = Joi.object({
  registrationNumber: Joi.string().required(),
  website: Joi.string().uri().optional(),
  industry: Joi.string().optional(),
  address: addressSchema.required(),
  contactPerson: contactPersonSchema.required(),
});

const taxInfoSchema = Joi.object({
  taxId: Joi.string().required(),
  vatNumber: Joi.string().optional(),
  taxDocumentUrl: Joi.string().uri().optional(),
});

// ---- Vendor CRUD ----

export const createVendorSchema = Joi.object({
  companyName: Joi.string().min(2).max(200).required(),
  companyInfo: companyInfoSchema.required(),
  taxInfo: taxInfoSchema.required(),
  categories: Joi.array().items(objectId).optional(),
});

export const updateVendorSchema = Joi.object({
  companyName: Joi.string().min(2).max(200).optional(),
  companyInfo: companyInfoSchema.optional(),
  taxInfo: taxInfoSchema.optional(),
  categories: Joi.array().items(objectId).optional(),
}).min(1);

export const updateVendorStatusSchema = Joi.object({
  status: Joi.string().valid("active", "suspended", "blacklisted").required(),
  reason: Joi.string().when("status", {
    is: "blacklisted",
    then: Joi.string().min(5).required(),
    otherwise: Joi.string().optional(),
  }),
});

export const vendorIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const listVendorsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.string().valid("pending", "active", "suspended", "blacklisted").optional(),
  category: objectId.optional(),
  search: Joi.string().max(100).optional(),
});

// ---- Ratings ----

export const rateVendorSchema = Joi.object({
  deliveryScore: Joi.number().min(1).max(5).required(),
  qualityScore: Joi.number().min(1).max(5).required(),
  costEfficiencyScore: Joi.number().min(1).max(5).required(),
  complianceScore: Joi.number().min(1).max(5).required(),
  comments: Joi.string().max(1000).optional(),
});

// ---- Certifications ----

export const addCertificationSchema = Joi.object({
  name: Joi.string().required(),
  issuingAuthority: Joi.string().required(),
  certificateNumber: Joi.string().required(),
  issueDate: Joi.date().iso().required(),
  expiryDate: Joi.date().iso().greater(Joi.ref("issueDate")).optional(),
  documentUrl: Joi.string().uri().required(),
});

// ---- Bank Accounts ----

export const addBankAccountSchema = Joi.object({
  bankName: Joi.string().required(),
  accountTitle: Joi.string().required(),
  accountNumber: Joi.string().required(),
  iban: Joi.string().optional(),
  swiftCode: Joi.string().optional(),
  branchCode: Joi.string().optional(),
  isPrimary: Joi.boolean().optional(),
});

// ---- Vendor Categories ----

export const createVendorCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

// ---- Exported middleware (what routes actually import) ----

export const validateCreateVendor = validate(createVendorSchema, "body");
export const validateUpdateVendor = validate(updateVendorSchema, "body");
export const validateUpdateVendorStatus = validate(updateVendorStatusSchema, "body");
export const validateVendorIdParam = validate(vendorIdParamSchema, "params");
export const validateListVendorsQuery = validate(listVendorsQuerySchema, "query");
export const validateRateVendor = validate(rateVendorSchema, "body");
export const validateAddCertification = validate(addCertificationSchema, "body");
export const validateAddBankAccount = validate(addBankAccountSchema, "body");
export const validateCreateVendorCategory = validate(createVendorCategorySchema, "body");