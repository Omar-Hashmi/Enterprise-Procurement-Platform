const express = require("express");

const approvalController = require("../controllers/approval.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "department_manager",
        "finance_manager",
        "procurement_manager",
        "ceo",
        "admin",
    ]),
    approvalController.createApproval
);

router.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "department_manager",
        "finance_manager",
        "procurement_manager",
        "ceo",
        "admin",
    ]),
    approvalController.getAllApprovals
);

router.get(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "department_manager",
        "finance_manager",
        "procurement_manager",
        "ceo",
        "admin",
    ]),
    approvalController.getApprovalById
);

router.get(
    "/purchase-request/:purchaseRequestId",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "employee",
        "department",
        "department_manager",
        "finance_manager",
        "procurement_manager",
        "procurement_officer",
        "ceo",
        "admin",
    ]),
    approvalController.getApprovalsByPurchaseRequest
);

router.put(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.authorize([
        "department",
        "department_manager",
        "finance_manager",
        "procurement_manager",
        "ceo",
        "admin",
    ]),
    approvalController.updateApproval
);

module.exports = router;