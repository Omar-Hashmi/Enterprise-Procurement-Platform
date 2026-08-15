const { Schema, model } = require("mongoose");

/**
 * Inventory Integration Module
 * Covers: Goods Received, Pending Deliveries, Warehouse Allocation, Stock Updates
 */

const ReceivedItemSchema = new Schema(
  {
    purchaseOrderItemId: { type: Schema.Types.ObjectId, required: true },
    itemName: { type: String, required: true },
    quantityOrdered: { type: Number, required: true, min: 0 },
    quantityReceived: { type: Number, required: true, min: 0, default: 0 },
    quantityRejected: { type: Number, default: 0, min: 0 },
    rejectionReason: { type: String },
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receivedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const StockMovementSchema = new Schema(
  {
    type: { type: String, enum: ["inbound", "outbound", "adjustment", "transfer"], required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    fromWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    toWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    reference: { type: Schema.Types.ObjectId },
    referenceType: { type: String, enum: ["PurchaseOrder", "Manual", "Transfer"] },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const InventorySchema = new Schema(
  {
    purchaseOrder: { type: Schema.Types.ObjectId, ref: "PurchaseOrder", required: true, index: true },
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    deliveryStatus: {
      type: String,
      enum: ["pending", "partially_received", "received", "cancelled"],
      default: "pending",
      index: true,
    },
    expectedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    receivedItems: [ReceivedItemSchema],
    stockMovements: [StockMovementSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

// Derive deliveryStatus from received quantities vs ordered quantities
InventorySchema.pre("save", function () {
  if (this.receivedItems && this.receivedItems.length > 0) {
    const fullyReceived = this.receivedItems.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    );
    const anyReceived = this.receivedItems.some((item) => item.quantityReceived > 0);

    if (fullyReceived) {
      this.deliveryStatus = "received";
      if (!this.actualDeliveryDate) this.actualDeliveryDate = new Date();
    } else if (anyReceived) {
      this.deliveryStatus = "partially_received";
    }
  }
});

InventorySchema.index({ warehouse: 1, deliveryStatus: 1 });
InventorySchema.index({ expectedDeliveryDate: 1 });

const Inventory = model("Inventory", InventorySchema);

/**
 * Warehouse - referenced by Inventory for warehouse allocation.
 */
const WarehouseSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    capacity: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Warehouse = model("Warehouse", WarehouseSchema);

module.exports = {
  Inventory,
  Warehouse,
};