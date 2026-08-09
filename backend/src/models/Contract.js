const { Schema, model } = require("mongoose");

/**
 * Contract Management Module
 * Covers: Vendor Contracts, Renewal Dates, Contract Expiry,
 * Attachments, Compliance Documents
 */

const ComplianceDocumentSchema = new Schema(
  {
    name: { type: String, required: true },
    documentUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
  },
  { _id: true }
);

const ContractAttachmentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const RenewalReminderSchema = new Schema(
  {
    reminderDate: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { _id: true }
);

const ContractSchema = new Schema(
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
ContractSchema.pre("save", function () {
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

const Contract = model("Contract", ContractSchema);

module.exports = {
  Contract,
};