const { inventoryService } = require("../services/inventory.service");
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/AppError");

const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20));
  return { page, limit };
};

const getIdParam = (req, name = "id") => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return value;
};

// ---- Delivery Records ----

const createDeliveryRecord = catchAsync(async (req, res) => {
  const delivery = await inventoryService.createDeliveryRecord({
    purchaseOrder: req.body.purchaseOrder,
    warehouse: req.body.warehouse,
    expectedDeliveryDate: new Date(req.body.expectedDeliveryDate),
    notes: req.body.notes,
  });

  res.status(201).json({ success: true, data: delivery });
});

const getDeliveries = catchAsync(async (req, res) => {
  const pagination = parsePagination(req);
  const filter = {
    warehouse: req.query.warehouse,
    deliveryStatus: req.query.deliveryStatus,
    purchaseOrder: req.query.purchaseOrder,
  };

  const result = await inventoryService.getDeliveries(filter, pagination);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

const getDeliveryById = catchAsync(async (req, res) => {
  const delivery = await inventoryService.getDeliveryById(getIdParam(req));
  res.status(200).json({ success: true, data: delivery });
});

const getDeliveriesByPurchaseOrder = catchAsync(async (req, res) => {
  const deliveries = await inventoryService.getDeliveriesByPurchaseOrder(
    getIdParam(req, "purchaseOrderId")
  );
  res.status(200).json({ success: true, data: deliveries });
});

const updateDelivery = catchAsync(async (req, res) => {
  const delivery = await inventoryService.updateDelivery(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: delivery });
});

const receiveGoods = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const delivery = await inventoryService.receiveGoods(
    getIdParam(req),
    req.body.items,
    req.body.warehouse,
    req.user.id
  );

  res.status(200).json({ success: true, data: delivery });
});

const recordStockMovement = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const delivery = await inventoryService.recordStockMovement(getIdParam(req), {
    type: req.body.type,
    itemName: req.body.itemName,
    quantity: req.body.quantity,
    fromWarehouse: req.body.fromWarehouse,
    toWarehouse: req.body.toWarehouse,
    reference: req.body.reference,
    referenceType: req.body.referenceType,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: delivery });
});

const cancelDelivery = catchAsync(async (req, res) => {
  const delivery = await inventoryService.cancelDelivery(getIdParam(req));
  res.status(200).json({ success: true, data: delivery });
});

const getPendingDeliveries = catchAsync(async (req, res) => {
  const deliveries = await inventoryService.getPendingDeliveries(
    req.query.warehouse
  );
  res.status(200).json({ success: true, data: deliveries });
});

const getDeliveryStatusSummary = catchAsync(async (_req, res) => {
  const summary = await inventoryService.getDeliveryStatusSummary();
  res.status(200).json({ success: true, data: summary });
});

// ---- Warehouses ----

const createWarehouse = catchAsync(async (req, res) => {
  const warehouse = await inventoryService.createWarehouse({
    name: req.body.name,
    code: req.body.code,
    location: req.body.location,
    capacity: req.body.capacity,
  });

  res.status(201).json({ success: true, data: warehouse });
});

const getWarehouses = catchAsync(async (req, res) => {
  const activeOnly = req.query.includeInactive !== "true";
  const warehouses = await inventoryService.getWarehouses(activeOnly);
  res.status(200).json({ success: true, data: warehouses });
});

const getWarehouseById = catchAsync(async (req, res) => {
  const warehouse = await inventoryService.getWarehouseById(getIdParam(req, "warehouseId"));
  res.status(200).json({ success: true, data: warehouse });
});

const updateWarehouse = catchAsync(async (req, res) => {
  const warehouse = await inventoryService.updateWarehouse(
    getIdParam(req, "warehouseId"),
    req.body
  );
  res.status(200).json({ success: true, data: warehouse });
});

const deactivateWarehouse = catchAsync(async (req, res) => {
  const warehouse = await inventoryService.deactivateWarehouse(getIdParam(req, "warehouseId"));
  res.status(200).json({ success: true, data: warehouse });
});

module.exports = {
  createDeliveryRecord,
  getDeliveries,
  getDeliveryById,
  getDeliveriesByPurchaseOrder,
  updateDelivery,
  receiveGoods,
  recordStockMovement,
  cancelDelivery,
  getPendingDeliveries,
  getDeliveryStatusSummary,
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deactivateWarehouse,
};