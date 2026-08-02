const express = require("express");
const purchaseRequestController = require("../controllers/purchase-request.controller");
const {
    authenticate,
    authorize,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.createPurchaseRequest
);

router.get(
    "/",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.getAllPurchaseRequests
);

router.get(
    "/:id",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.getPurchaseRequestById
);

router.put(
    "/:id",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.updatePurchaseRequest
);

router.patch(
    "/:id/cancel",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.cancelPurchaseRequest
);

module.exports = router;