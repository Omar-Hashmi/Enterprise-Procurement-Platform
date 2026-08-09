const express = require("express");

const purchaseOrderController = require("../controllers/purchase-order.controller");
const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Create Purchase Order
router.post(
    "/",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    purchaseOrderController.createPurchaseOrder
);

// Get All Purchase Orders
router.get(
    "/",
    authenticate,
    authorize(["admin", "procurement_manager", "finance_manager"]),
    purchaseOrderController.getAllPurchaseOrders
);

// Get Purchase Order By ID
router.get(
    "/:id",
    authenticate,
    authorize(["admin", "procurement_manager", "finance_manager"]),
    purchaseOrderController.getPurchaseOrderById
);

// Update Purchase Order
router.put(
    "/:id",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    purchaseOrderController.updatePurchaseOrder
);

// Cancel Purchase Order
router.patch(
    "/:id/cancel",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    purchaseOrderController.cancelPurchaseOrder
);

module.exports = router;