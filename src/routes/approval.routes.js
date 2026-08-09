const express = require("express");

const approvalController = require("../controllers/approval.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "finance_manager",
        "procurement_manager",
        "ceo",
    ]),
    approvalController.createApproval
);

router.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "finance_manager",
        "procurement_manager",
        "ceo",
    ]),
    approvalController.getAllApprovals
);

router.get(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "finance_manager",
        "procurement_manager",
        "ceo",
    ]),
    approvalController.getApprovalById
);

router.get(
    "/purchase-request/:purchaseRequestId",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "finance_manager",
        "procurement_manager",
        "ceo",
    ]),
    approvalController.getApprovalsByPurchaseRequest
);

router.put(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "finance_manager",
        "procurement_manager",
        "ceo",
    ]),
    approvalController.updateApproval
);

module.exports = router;