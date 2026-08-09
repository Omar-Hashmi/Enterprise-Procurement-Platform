// File: RFQ.model.js

const { Schema, model } = require("mongoose");

/**
 * RFQ (Request for Quotation) Module
 * Covers: Create RFQ, Invite Vendors, Submit Quotations,
 * Price Comparison, Technical Evaluation, Vendor Selection
 */

const RFQItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    specifications: { type: String },
  },
  { _id: true }
);

const QuotationItemSchema = new Schema(
  {
    rfqItemId: { type: Schema.Types.ObjectId, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number, required: true, min: 0 },
    remarks: { type: String },
  },
  { _id: false }
);

const QuotationSchema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    status: {
      type: String,
      enum: ["invited", "submitted", "shortlisted", "rejected", "selected"],
      default: "invited",
    },
    items: [QuotationItemSchema],
    totalQuoteAmount: { type: Number, default: 0, min: 0 },
    paymentTerms: { type: String },
    deliveryTerms: { type: String },
    validUntil: { type: Date },
    attachments: [{ type: String }],
    technicalScore: { type: Number, min: 0, max: 100 },
    evaluationNotes: { type: String },
    submittedAt: { type: Date },
  },
  { _id: true, timestamps: true }
);

const RFQSchema = new Schema(
  {
    rfqNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    purchaseRequisition: { type: Schema.Types.ObjectId, ref: "PurchaseRequisition" },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    items: {
      type: [RFQItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    invitedVendors: [{ type: Schema.Types.ObjectId, ref: "Vendor" }],
    quotations: [QuotationSchema],
    submissionDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "quotes_received",
        "under_evaluation",
        "vendor_selected",
        "closed",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },
    selectedVendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    selectedQuotationId: { type: Schema.Types.ObjectId },
    selectionJustification: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Keep quotation totalQuoteAmount in sync with its line items
QuotationSchema.pre("validate", function () {
  if (this.items && this.items.length > 0) {
    this.totalQuoteAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
});

RFQSchema.index({ status: 1, submissionDeadline: 1 });
RFQSchema.index({ department: 1, status: 1 });
RFQSchema.index({ "quotations.vendor": 1 });

const RFQ = model("RFQ", RFQSchema);

module.exports = {
  RFQ,
};