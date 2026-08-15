const { inventoryRepository } = require("../repositories/inventory.repository");

/**
 * Service Layer — encapsulates Inventory Integration business rules:
 * pending-delivery tracking, goods receipt against a PO, warehouse
 * allocation, and stock-movement logging.
 */
class InventoryService {
  async createDeliveryRecord(input) {
    const warehouse = await inventoryRepository.findWarehouseById(input.warehouse);
    if (!warehouse) throw new AppError("Warehouse not found.", 404);
    if (!warehouse.isActive) throw new AppError("Cannot allocate deliveries to an inactive warehouse.", 400);

    return inventoryRepository.create({
      purchaseOrder: input.purchaseOrder,
      warehouse: input.warehouse,
      expectedDeliveryDate: input.expectedDeliveryDate,
      deliveryStatus: "pending",
      receivedItems: [],
      stockMovements: [],
      notes: input.notes,
    });
  }

  async getDeliveries(filter, pagination) {
    return inventoryRepository.findAll(filter, pagination);
  }

  async getDeliveryById(id) {
    const delivery = await inventoryRepository.findById(id);
    if (!delivery) throw new AppError("Delivery record not found.", 404);
    return delivery;
  }

  async getDeliveriesByPurchaseOrder(purchaseOrderId) {
    return inventoryRepository.findByPurchaseOrder(purchaseOrderId);
  }

  async updateDelivery(id, payload) {
    const delivery = await inventoryRepository.findById(id);
    if (!delivery) throw new AppError("Delivery record not found.", 404);
    if (delivery.deliveryStatus === "received" || delivery.deliveryStatus === "cancelled") {
      throw new AppError(`Cannot edit a delivery that is already ${delivery.deliveryStatus}.`, 400);
    }

    const { deliveryStatus, receivedItems, stockMovements, purchaseOrder, ...safePayload } = payload;

    const updated = await inventoryRepository.update(id, safePayload);
    if (!updated) throw new AppError("Delivery record not found.", 404);
    return updated;
  }

  /** Goods Received — records receipt of one or more line items against a delivery. */
  async receiveGoods(id, items, warehouseId, receivedBy) {
    if (!items || items.length === 0) {
      throw new AppError("At least one received item is required.", 400);
    }

    const delivery = await this.getDeliveryById(id);
    if (delivery.deliveryStatus === "cancelled") {
      throw new AppError("Cannot receive goods against a cancelled delivery.", 400);
    }
    if (delivery.deliveryStatus === "received") {
      throw new AppError("This delivery has already been fully received.", 400);
    }

    for (const item of items) {
      const rejected = item.quantityRejected ?? 0;
      if (item.quantityReceived + rejected > item.quantityOrdered) {
        throw new AppError(
          `Received + rejected quantity for '${item.itemName}' cannot exceed the ordered quantity.`,
          400
        );
      }
      if (item.quantityReceived < 0 || rejected < 0) {
        throw new AppError("Quantities cannot be negative.", 400);
      }
    }

    const updated = await inventoryRepository.receiveItems(
      id,
      items.map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        itemName: item.itemName,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityReceived,
        quantityRejected: item.quantityRejected ?? 0,
        rejectionReason: item.rejectionReason,
        warehouse: warehouseId,
        receivedBy,
      }))
    );
    if (!updated) throw new AppError("Delivery record not found.", 404);
    return updated;
  }

  /** Stock Updates — manual outbound/adjustment/transfer movements outside of goods receipt. */
  async recordStockMovement(id, input) {
    if (input.quantity <= 0) throw new AppError("Movement quantity must be greater than zero.", 400);

    if (input.type === "transfer" && (!input.fromWarehouse || !input.toWarehouse)) {
      throw new AppError("A transfer requires both a source and destination warehouse.", 400);
    }
    if (input.type === "outbound" && !input.fromWarehouse) {
      throw new AppError("An outbound movement requires a source warehouse.", 400);
    }

    const movement = {
      type: input.type,
      itemName: input.itemName,
      quantity: input.quantity,
      fromWarehouse: input.fromWarehouse,
      toWarehouse: input.toWarehouse,
      reference: input.reference,
      referenceType: input.referenceType,
      performedBy: input.performedBy,
      createdAt: new Date(),
    };

    const updated = await inventoryRepository.addStockMovement(id, movement);
    if (!updated) throw new AppError("Delivery record not found.", 404);
    return updated;
  }

  async cancelDelivery(id) {
    const delivery = await this.getDeliveryById(id);
    if (delivery.deliveryStatus === "received") {
      throw new AppError("A fully received delivery cannot be cancelled.", 400);
    }

    const updated = await inventoryRepository.cancelDelivery(id);
    if (!updated) throw new AppError("Delivery record not found.", 404);
    return updated;
  }

  /** Pending Deliveries — deliveries not yet fully received, optionally scoped to a warehouse. */
  async getPendingDeliveries(warehouseId) {
    return inventoryRepository.findPendingDeliveries(warehouseId);
  }

  async getDeliveryStatusSummary() {
    return inventoryRepository.countByDeliveryStatus();
  }

  // ---- Warehouse Allocation ----

  async createWarehouse(input) {
    const existing = await inventoryRepository.findWarehouseByCode(input.code);
    if (existing) throw new AppError("A warehouse with this code already exists.", 409);

    return inventoryRepository.createWarehouse(input);
  }

  async getWarehouses(activeOnly = true) {
    return inventoryRepository.findAllWarehouses(activeOnly);
  }

  async getWarehouseById(id) {
    const warehouse = await inventoryRepository.findWarehouseById(id);
    if (!warehouse) throw new AppError("Warehouse not found.", 404);
    return warehouse;
  }

  async updateWarehouse(id, payload) {
    const { code, ...safePayload } = payload;
    const warehouse = await inventoryRepository.updateWarehouse(id, safePayload);
    if (!warehouse) throw new AppError("Warehouse not found.", 404);
    return warehouse;
  }

  async deactivateWarehouse(id) {
    const warehouse = await inventoryRepository.deactivateWarehouse(id);
    if (!warehouse) throw new AppError("Warehouse not found.", 404);
    return warehouse;
  }
}

module.exports = {
  inventoryService: new InventoryService(),
};