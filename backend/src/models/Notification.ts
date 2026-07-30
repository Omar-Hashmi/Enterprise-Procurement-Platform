import { Schema, model, Document, Types } from "mongoose";

/**
 * Notification Model
 * Primary owner: Developer 1 (Notifications via Socket.IO)
 * Included here because it's a shared dependency — Developer 2's modules
 * (RFQ emails, Contract renewal reminders, Budget alerts, Email Queue)
 * all write to this collection to trigger in-app + email notifications.
 */

export type NotificationType =
  | "rfq_invite"
  | "rfq_quote_received"
  | "contract_renewal_reminder"
  | "contract_expiring"
  | "budget_warning"
  | "budget_exhausted"
  | "goods_received"
  | "delivery_pending"
  | "vendor_status_change"
  | "general";

export type NotificationChannel = "in_app" | "email" | "both";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  relatedEntity?: Types.ObjectId;
  relatedEntityType?: "Vendor" | "RFQ" | "Budget" | "Contract" | "Inventory";
  isRead: boolean;
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
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

export const Notification = model<INotification>("Notification", NotificationSchema);