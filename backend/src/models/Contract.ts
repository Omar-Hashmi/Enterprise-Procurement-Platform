import { Schema, model, Document, Types, HydratedDocument } from "mongoose";

/**
 * Contract Management Module
 * Covers: Vendor Contracts, Renewal Dates, Contract Expiry,
 * Attachments, Compliance Documents
 */

export type ContractStatus = "draft" | "active" | "expiring_soon" | "expired" | "terminated";

export interface IComplianceDocument {
  name: string;
  documentUrl: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface IContractAttachment {
  fileName: string;
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IRenewalReminder {
  reminderDate: Date;
  sent: boolean;
  sentAt?: Date;
}

export interface IContract extends Document {
  contractNumber: string;
  title: string;
  vendor: Types.ObjectId;
  department: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  renewalNoticeDays: number; // how many days before expiry to notify
  renewalReminders: IRenewalReminder[];
  value: number;
  currency: string;
  paymentTerms?: string;
  status: ContractStatus;
  attachments: IContractAttachment[];
  complianceDocuments: IComplianceDocument[];
  terminationReason?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceDocumentSchema = new Schema<IComplianceDocument>(
  {
    name: { type: String, required: true },
    documentUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
  },
  { _id: true }
);

const ContractAttachmentSchema = new Schema<IContractAttachment>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const RenewalReminderSchema = new Schema<IRenewalReminder>(
  {
    reminderDate: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { _id: true }
);

const ContractSchema = new Schema<IContract>(
  {
    contractNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },
    renewalNoticeDays: { type: Number, default: 30 },
    renewalReminders: [RenewalReminderSchema],
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    paymentTerms: { type: String },
    status: {
      type: String,
      enum: ["draft", "active", "expiring_soon", "expired", "terminated"],
      default: "draft",
      index: true,
    },
    attachments: [ContractAttachmentSchema],
    complianceDocuments: [ComplianceDocumentSchema],
    terminationReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Auto-derive status from dates unless explicitly terminated
ContractSchema.pre("save", function (this: HydratedDocument<IContract>) {
  if (this.status === "terminated") return;

  const now = new Date();
  const noticeWindowStart = new Date(this.endDate);
  noticeWindowStart.setDate(noticeWindowStart.getDate() - this.renewalNoticeDays);

  if (now > this.endDate) {
    this.status = "expired";
  } else if (now >= noticeWindowStart) {
    this.status = "expiring_soon";
  } else if (this.status === "draft" && now >= this.startDate) {
    this.status = "active";
  }
});

ContractSchema.index({ vendor: 1, status: 1 });
ContractSchema.index({ endDate: 1 });

export const Contract = model<IContract>("Contract", ContractSchema);