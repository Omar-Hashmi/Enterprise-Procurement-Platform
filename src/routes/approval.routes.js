const express = require("express");

const approvalController = require("../controllers/approval.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    approvalController.createApproval
);

router.get(
    "/",
    authenticate,
    approvalController.getAllApprovals
);

router.get(
    "/:id",
    authenticate,
    approvalController.getApprovalById
);

router.get(
    "/purchase-request/:purchaseRequestId",
    authenticate,
    approvalController.getApprovalsByPurchaseRequest
);

router.put(
    "/:id",
    authenticate,
    approvalController.updateApproval
);

module.exports = router;