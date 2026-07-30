import { Schema, model, Document, Types, HydratedDocument } from "mongoose";

/**
 * Budget Management Module
 * Covers: Department Budgets, Project Budgets, Remaining Budget,
 * Purchase Limits, Budget Warnings
 */

export type BudgetPeriod = "monthly" | "quarterly" | "annual";
export type BudgetStatus = "active" | "exhausted" | "closed";

export interface IBudgetTransaction {
  type: "allocation" | "deduction" | "release" | "adjustment";
  amount: number;
  reference?: Types.ObjectId; // e.g. Purchase Order or RFQ id that triggered it
  referenceType?: "PurchaseOrder" | "RFQ" | "Manual";
  note?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IBudget extends Document {
  department: Types.ObjectId;
  project?: Types.ObjectId;
  fiscalYear: number;
  period: BudgetPeriod;
  allocatedAmount: number;
  spentAmount: number;
  reservedAmount: number; // committed but not yet spent (e.g. open POs)
  remainingAmount: number;
  purchaseLimit: number; // max single-purchase amount without escalation
  warningThresholdPercent: number; // e.g. 80 -> warn at 80% utilization
  status: BudgetStatus;
  transactions: IBudgetTransaction[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetTransactionSchema = new Schema<IBudgetTransaction>(
  {
    type: {
      type: String,
      enum: ["allocation", "deduction", "release", "adjustment"],
      required: true,
    },
    amount: { type: Number, required: true },
    reference: { type: Schema.Types.ObjectId },
    referenceType: { type: String, enum: ["PurchaseOrder", "RFQ", "Manual"] },
    note: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BudgetSchema = new Schema<IBudget>(
  {
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    fiscalYear: { type: Number, required: true },
    period: { type: String, enum: ["monthly", "quarterly", "annual"], default: "annual" },
    allocatedAmount: { type: Number, required: true, min: 0 },
    spentAmount: { type: Number, default: 0, min: 0 },
    reservedAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0 },
    purchaseLimit: { type: Number, required: true, min: 0 },
    warningThresholdPercent: { type: Number, default: 80, min: 1, max: 100 },
    status: { type: String, enum: ["active", "exhausted", "closed"], default: "active" },
    transactions: [BudgetTransactionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Keep remainingAmount and status derived and consistent
BudgetSchema.pre("save", function (this: HydratedDocument<IBudget>) {
  this.remainingAmount = this.allocatedAmount - this.spentAmount - this.reservedAmount;
  if (this.remainingAmount <= 0) {
    this.status = "exhausted";
  } else if (this.status === "exhausted" && this.remainingAmount > 0) {
    this.status = "active";
  }
});

BudgetSchema.virtual("utilizationPercent").get(function (this: IBudget) {
  if (this.allocatedAmount === 0) return 0;
  return Number((((this.spentAmount + this.reservedAmount) / this.allocatedAmount) * 100).toFixed(2));
});

BudgetSchema.virtual("isOverThreshold").get(function (this: IBudget) {
  const utilization =
    this.allocatedAmount === 0
      ? 0
      : ((this.spentAmount + this.reservedAmount) / this.allocatedAmount) * 100;
  return utilization >= this.warningThresholdPercent;
});

BudgetSchema.set("toJSON", { virtuals: true });
BudgetSchema.set("toObject", { virtuals: true });

BudgetSchema.index({ department: 1, fiscalYear: 1, project: 1 }, { unique: true });
BudgetSchema.index({ status: 1 });

export const Budget = model<IBudget>("Budget", BudgetSchema);