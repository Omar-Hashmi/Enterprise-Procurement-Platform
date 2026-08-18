const { Schema, model } = require("mongoose");

/**
 * Vendor Management Module
 * Covers: Vendor Profiles, Company Information, Tax Information,
 * Certifications, Bank Accounts, Vendor Ratings, Vendor Categories
 */

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    postalCode: { type: String },
  },
  { _id: false }
);

const ContactPersonSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    designation: { type: String },
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    name: { type: String, required: true },
    issuingAuthority: { type: String, required: true },
    certificateNumber: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    documentUrl: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const BankAccountSchema = new Schema(
  {
    bankName: { type: String, required: true },
    accountTitle: { type: String, required: true },
    accountNumber: { type: String, required: true },
    iban: { type: String },
    swiftCode: { type: String },
    branchCode: { type: String },
    currency: { type: String, default: "PKR", trim: true, uppercase: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const VendorRatingSchema = new Schema(
  {
    ratedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deliveryScore: { type: Number, min: 1, max: 5, required: true },
    qualityScore: { type: Number, min: 1, max: 5, required: true },
    costEfficiencyScore: { type: Number, min: 1, max: 5, required: true },
    complianceScore: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
    ratedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const VendorSchema = new Schema(
  {
    vendorCode: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true, index: true },
    companyInfo: {
      registrationNumber: { type: String, required: true },
      website: { type: String },
      industry: { type: String },
      address: { type: AddressSchema, required: true },
      contactPerson: { type: ContactPersonSchema, required: true },
    },
    taxInfo: {
      taxId: { type: String, required: true },
      vatNumber: { type: String },
      taxDocumentUrl: { type: String },
    },
    categories: [{ type: Schema.Types.ObjectId, ref: "VendorCategory" }],
    certifications: [CertificationSchema],
    bankAccounts: [BankAccountSchema],
    ratings: [VendorRatingSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "blacklisted"],
      default: "pending",
      index: true,
    },
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Recalculate average rating whenever ratings array changes
VendorSchema.pre("save", function () {
  if (this.isModified("ratings") && this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, r) => {
      return (
        sum +
        (r.deliveryScore + r.qualityScore + r.costEfficiencyScore + r.complianceScore) / 4
      );
    }, 0);
    this.averageRating = Number((total / this.ratings.length).toFixed(2));
  }
});

VendorSchema.index({ companyName: "text", vendorCode: "text" });
VendorSchema.index({ status: 1, categories: 1 });

const Vendor = model("Vendor", VendorSchema);

/**
 * Vendor Category - separate collection so categories can be managed
 * independently (create/rename/deactivate) without touching vendor docs.
 */
const VendorCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const VendorCategory = model("VendorCategory", VendorCategorySchema);

module.exports = {
  Vendor,
  VendorCategory,
};
