const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const approvalService = require("../backend/src/services/approval.service");
const purchaseOrderService = require("../backend/src/services/purchase-order.service");
const approvalRepository = require("../backend/src/repositories/approval.repository");
const purchaseRequestRepository = require("../backend/src/repositories/purchase-request.repository");
const userRepository = require("../backend/src/repositories/user.repository");

test("department approval succeeds for a pending request", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "department",
        currentStatus: "Pending",
        hasDepartmentApproval: false,
        hasFinanceApproval: false,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.nextStatus, "Department Approved");
});

test("finance before department fails", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "finance_manager",
        currentStatus: "Pending",
        hasDepartmentApproval: false,
        hasFinanceApproval: false,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, false);
    assert.match(result.message, /Department approval/i);
});

test("finance after department succeeds", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "finance_manager",
        currentStatus: "Department Approved",
        hasDepartmentApproval: true,
        hasFinanceApproval: false,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.nextStatus, "Finance Approved");
});

test("procurement before finance fails", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "procurement_manager",
        currentStatus: "Pending",
        hasDepartmentApproval: true,
        hasFinanceApproval: false,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, false);
    assert.match(result.message, /Finance approval/i);
});

test("procurement after finance succeeds", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "procurement_manager",
        currentStatus: "Finance Approved",
        hasDepartmentApproval: true,
        hasFinanceApproval: true,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.nextStatus, "Procurement Approved");
});

test("ceo before procurement fails", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "ceo",
        currentStatus: "Pending",
        hasDepartmentApproval: true,
        hasFinanceApproval: true,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, false);
    assert.match(result.message, /Procurement approval/i);
});

test("ceo after procurement succeeds", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "ceo",
        currentStatus: "Procurement Approved",
        hasDepartmentApproval: true,
        hasFinanceApproval: true,
        hasProcurementApproval: true,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.nextStatus, "Approved");
});

test("duplicate approval fails", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "department",
        currentStatus: "Pending",
        hasDepartmentApproval: true,
        hasFinanceApproval: false,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, false);
    assert.match(result.message, /duplicate/i);
});

test("invalid role fails", () => {
    const result = approvalService.validateApprovalSequence({
        currentRole: "admin",
        currentStatus: "Pending",
        hasDepartmentApproval: false,
        hasFinanceApproval: false,
        hasProcurementApproval: false,
        hasCeoApproval: false,
    });

    assert.equal(result.allowed, false);
    assert.match(result.message, /Invalid approver role/i);
});

test("rejected request cannot be approved", async () => {
    const purchaseRequestStub = mock.method(
        purchaseRequestRepository,
        "getPurchaseRequestById",
        async () => ({
            _id: "507f1f77bcf86cd799439011",
            status: "Rejected",
        })
    );
    const userStub = mock.method(userRepository, "getUserById", async () => ({
        role: "department",
    }));

    try {
        await assert.rejects(
            () =>
                approvalService.createApproval({
                    purchaseRequest: "507f1f77bcf86cd799439011",
                    approvedBy: "507f1f77bcf86cd799439012",
                    role: "department",
                }),
            /Approval is no longer allowed/i
        );
    } finally {
        purchaseRequestStub.mock.restore();
        userStub.mock.restore();
    }
});

test("cancelled request cannot be approved", async () => {
    const purchaseRequestStub = mock.method(
        purchaseRequestRepository,
        "getPurchaseRequestById",
        async () => ({
            _id: "507f1f77bcf86cd799439011",
            status: "Cancelled",
        })
    );
    const userStub = mock.method(userRepository, "getUserById", async () => ({
        role: "department",
    }));

    try {
        await assert.rejects(
            () =>
                approvalService.createApproval({
                    purchaseRequest: "507f1f77bcf86cd799439011",
                    approvedBy: "507f1f77bcf86cd799439012",
                    role: "department",
                }),
            /Approval is no longer allowed/i
        );
    } finally {
        purchaseRequestStub.mock.restore();
        userStub.mock.restore();
    }
});

test("purchase order status transition rejects invalid progression", () => {
    const result = purchaseOrderService.validatePurchaseOrderStatusTransition(
        "Completed",
        "Accepted"
    );

    assert.equal(result.allowed, false);
    assert.match(result.message, /Invalid status transition/i);
});