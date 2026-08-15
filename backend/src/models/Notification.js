// File: notification.model.js

const { Schema, model } = require("mongoose");

/**
 * Notification Model
 * Primary owner: Developer 1 (Notifications via Socket.IO)
 * Included here because it's a shared dependency — Developer 2's modules
 * (RFQ emails, Contract renewal reminders, Budget alerts, Email Queue)
 * all write to this collection to trigger in-app + email notifications.
 */

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "rfq_invite",
        "rfq_quote_received",
        "contract_renewal_reminder",
        "contract_expiring",
        "budget_warning",
        "budget_exhausted",
        "goods_received",
        "delivery_pending",
        "vendor_status_change",
        "general",
      ],
      required: true,
    },
    channel: { type: String, enum: ["in_app", "email", "both"], default: "in_app" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntity: { type: Schema.Types.ObjectId },
    relatedEntityType: {
      type: String,
      enum: ["Vendor", "RFQ", "Budget", "Contract", "Inventory"],
    },
    isRead: { type: Boolean, default: false, index: true },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = model("Notification", NotificationSchema);

module.exports = {
  Notification,
};