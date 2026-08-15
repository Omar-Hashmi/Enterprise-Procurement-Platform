// File: inventory.repository.js

const { Types } = require("mongoose");
const { Inventory, Warehouse } = require("../models/Inventory");

/**
 * Repository Pattern — isolates all Mongoose/DB access for Inventory
 * (goods receipt, deliveries, stock movements) and its companion
 * Warehouse collection, since no separate warehouse repository exists.
 */
class InventoryRepository {
  // ---- Delivery Records ----

  async create(payload) {
    return Inventory.create(payload);
  }

  async findById(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Inventory.findById(id).populate("warehouse").populate("purchaseOrder").exec();
  }

  async findByPurchaseOrder(purchaseOrderId) {
    return Inventory.find({ purchaseOrder: purchaseOrderId }).populate("warehouse").exec();
  }

  async findAll(filter, { page, limit }) {
    const query = {};

    if (filter.warehouse) query.warehouse = filter.warehouse;
    if (filter.deliveryStatus) query.deliveryStatus = filter.deliveryStatus;
    if (filter.purchaseOrder) {
      query.purchaseOrder = filter.purchaseOrder;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Inventory.find(query)
        .populate("warehouse")
        .sort({ expectedDeliveryDate: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Inventory.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPendingDeliveries(warehouseId) {
    const query = {
      deliveryStatus: { $in: ["pending", "partially_received"] },
    };
    if (warehouseId) query.warehouse = warehouseId;

    return Inventory.find(query).populate("warehouse").sort({ expectedDeliveryDate: 1 }).exec();
  }

  async update(id, payload) {
    return Inventory.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
  }

  /**
   * Records receipt against one or more line items. Creates a new
   * receivedItems entry if this is the first receipt for that PO line,
   * otherwise adds to the running received/rejected quantities.
   */
  async receiveItems(id, receipts) {
    const inventory = await Inventory.findById(id).exec();
    if (!inventory) return null;

    for (const receipt of receipts) {
      const existing = inventory.receivedItems.find(
        (item) => item.purchaseOrderItemId.toString() === receipt.purchaseOrderItemId
      );

      if (existing) {
        existing.quantityReceived += receipt.quantityReceived;
        existing.quantityRejected += receipt.quantityRejected;
        if (receipt.rejectionReason) existing.rejectionReason = receipt.rejectionReason;
        existing.receivedAt = new Date();
      } else {
        inventory.receivedItems.push({
          purchaseOrderItemId: receipt.purchaseOrderItemId,
          itemName: receipt.itemName,
          quantityOrdered: receipt.quantityOrdered,
          quantityReceived: receipt.quantityReceived,
          quantityRejected: receipt.quantityRejected,
          rejectionReason: receipt.rejectionReason,
          warehouse: receipt.warehouse,
          receivedBy: receipt.receivedBy,
          receivedAt: new Date(),
        });
      }

      inventory.stockMovements.push({
        type: "inbound",
        itemName: receipt.itemName,
        quantity: receipt.quantityReceived,
        toWarehouse: receipt.warehouse,
        reference: inventory.purchaseOrder,
        referenceType: "PurchaseOrder",
        performedBy: receipt.receivedBy,
        createdAt: new Date(),
      });
    }

    await inventory.save(); // pre-save hook re-derives deliveryStatus
    return inventory;
  }

  async addStockMovement(id, movement) {
    const inventory = await Inventory.findById(id).exec();
    if (!inventory) return null;

    inventory.stockMovements.push(movement);
    await inventory.save();
    return inventory;
  }

  async cancelDelivery(id) {
    return Inventory.findByIdAndUpdate(
      id,
      { deliveryStatus: "cancelled" },
      { new: true, runValidators: true }
    ).exec();
  }

  async countByDeliveryStatus() {
    const results = await Inventory.aggregate([
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]).exec();

    return results.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }

  // ---- Warehouses ----

  async createWarehouse(payload) {
    return Warehouse.create(payload);
  }

  async findWarehouseById(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Warehouse.findById(id).exec();
  }

  async findWarehouseByCode(code) {
    return Warehouse.findOne({ code }).exec();
  }

  async findAllWarehouses(activeOnly = true) {
    const query = activeOnly ? { isActive: true } : {};
    return Warehouse.find(query).sort({ name: 1 }).exec();
  }

  async updateWarehouse(id, payload) {
    return Warehouse.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
  }

  async deactivateWarehouse(id) {
    return Warehouse.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    ).exec();
  }
}

const inventoryRepository = new InventoryRepository();

module.exports = {
  InventoryRepository,
  inventoryRepository,
};