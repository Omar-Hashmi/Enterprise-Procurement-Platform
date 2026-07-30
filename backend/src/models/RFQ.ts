import { Schema, model, Document, Types } from "mongoose";

/**
 * RFQ (Request for Quotation) Module
 * Owner: Developer 2
 * Covers: Create RFQ, Invite Vendors, Submit Quotations,
 * Price Comparison, Technical Evaluation, Vendor Selection
 */

export type RFQStatus =
  | "draft"
  | "published"
  | "quotes_received"
  | "under_evaluation"
  | "vendor_selected"
  | "closed"
  | "cancelled";

export type QuotationStatus = "invited" | "submitted" | "shortlisted" | "rejected" | "selected";

export interface IRFQItem {
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface IQuotationItem {
  rfqItemId: Types.ObjectId;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  remarks?: string;
}

export interface IQuotation {
  vendor: Types.ObjectId;
  status: QuotationStatus;
  items: IQuotationItem[];
  totalQuoteAmount: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  validUntil?: Date;
  attachments: string[];
  technicalScore?: number;
  evaluationNotes?: string;
  submittedAt?: Date;
}

export interface IRFQ extends Document {
  rfqNumber: string;
  title: string;
  description?: string;
  purchaseRequisition?: Types.ObjectId;
  department: Types.ObjectId;
  items: IRFQItem[];
  invitedVendors: Types.ObjectId[];
  quotations: IQuotation[];
  submissionDeadline: Date;
  status: RFQStatus;
  selectedVendor?: Types.ObjectId;
  selectedQuotationId?: Types.ObjectId;
  selectionJustification?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RFQItemSchema = new Schema<IRFQItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    specifications: { type: String },
  },
  { _id: true }
);

const QuotationItemSchema = new Schema<IQuotationItem>(
  {
    rfqItemId: { type: Schema.Types.ObjectId, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number, required: true, min: 0 },
    remarks: { type: String },
  },
  { _id: false }
);

const QuotationSchema = new Schema<IQuotation>(
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

const RFQSchema = new Schema<IRFQ>(
  {
    rfqNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    purchaseRequisition: { type: Schema.Types.ObjectId, ref: "PurchaseRequisition" },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    items: { type: [RFQItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
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
QuotationSchema.pre("validate", function (this: Document & IQuotation) {
  if (this.items && this.items.length > 0) {
    this.totalQuoteAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
});

RFQSchema.index({ status: 1, submissionDeadline: 1 });
RFQSchema.index({ department: 1, status: 1 });
RFQSchema.index({ "quotations.vendor": 1 });

export const RFQ = model<IRFQ>("RFQ", RFQSchema);