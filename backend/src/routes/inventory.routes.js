const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/restrictTo.middleware");
const {
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
} = require("../controllers/inventory.controller");
const {
  validateCreateDelivery,
  validateUpdateDelivery,
  validateInventoryIdParam,
  validatePurchaseOrderIdParam,
  validateListDeliveriesQuery,
  validatePendingDeliveriesQuery,
  validateReceiveGoods,
  validateStockMovement,
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateWarehouseIdParam,
  validateListWarehousesQuery,
} = require("../validations/inventory.validation");

const router = Router();

// All inventory routes require an authenticated session
router.use(protect);

// ---- Warehouses (kept above /:id so "warehouses" isn't parsed as an id) ----

router
  .route("/warehouses")
  .get(validateListWarehousesQuery, getWarehouses)
  .post(restrictTo("procurement_manager", "procurement_officer", "admin"), validateCreateWarehouse, createWarehouse);

router
  .route("/warehouses/:warehouseId")
  .get(validateWarehouseIdParam, getWarehouseById)
  .patch(
    restrictTo("procurement_manager", "procurement_officer", "admin"),
    validateWarehouseIdParam,
    validateUpdateWarehouse,
    updateWarehouse
  );

router.patch(
  "/warehouses/:warehouseId/deactivate",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateWarehouseIdParam,
  deactivateWarehouse
);

// ---- Pending Deliveries / Status summary ----

router.get("/pending", validatePendingDeliveriesQuery, getPendingDeliveries);
router.get(
  "/status-summary",
  restrictTo("procurement_manager", "procurement_officer", "warehouse_staff", "admin"),
  getDeliveryStatusSummary
);

router.get(
  "/purchase-order/:purchaseOrderId",
  validatePurchaseOrderIdParam,
  getDeliveriesByPurchaseOrder
);

// ---- Delivery Records ----

router
  .route("/")
  .get(validateListDeliveriesQuery, getDeliveries)
  .post(restrictTo("procurement_manager", "procurement_officer", "admin"), validateCreateDelivery, createDeliveryRecord);

router
  .route("/:id")
  .get(validateInventoryIdParam, getDeliveryById)
  .patch(
    restrictTo("procurement_manager", "procurement_officer", "warehouse_staff", "admin"),
    validateInventoryIdParam,
    validateUpdateDelivery,
    updateDelivery
  );

router.post(
  "/:id/receive",
  restrictTo("warehouse_staff", "procurement_manager", "procurement_officer", "admin"),
  validateInventoryIdParam,
  validateReceiveGoods,
  receiveGoods
);

router.post(
  "/:id/stock-movements",
  restrictTo("warehouse_staff", "procurement_manager", "procurement_officer", "admin"),
  validateInventoryIdParam,
  validateStockMovement,
  recordStockMovement
);

router.patch(
  "/:id/cancel",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateInventoryIdParam,
  cancelDelivery
);

module.exports = router;