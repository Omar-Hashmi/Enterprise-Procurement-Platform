const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = require("../src/app");
const authService = require("../src/services/auth.service");
const purchaseRequestService = require("../src/services/purchase-request.service");
const approvalService = require("../src/services/approval.service");
const purchaseOrderService = require("../src/services/purchase-order.service");

const User = require("../src/models/user.model");
const AuditLog = require("../src/models/audit-log.model");
const PurchaseRequest = require("../src/models/purchase-request.model");
const Approval = require("../src/models/approval.model");
const PurchaseOrder = require("../src/models/purchase-order.model");
const Quotation = require("../src/models/quotation.model");
const Vendor = require("../src/models/vendor.model");
const { connectTestDb, disconnectTestDb } = require("./test-db");

const jwtSecret = process.env.JWT_SECRET || "test-audit-secret";

process.env.JWT_SECRET = jwtSecret;

let server;
let baseUrl;
let adminToken;
let departmentToken;
let adminUser;
let departmentUser;
let financeUser;
let procurementUser;
let ceoUser;
let requesterUser;
let purchaseRequest;
let vendor;
let quotation;

async function login(email, password) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.ok(payload.token);
    return payload.token;
}

async function getAuditLog(action) {
    return await AuditLog.findOne({ action }).sort({ timestamp: -1 });
}

function assertNoSecrets(log) {
    const serialized = JSON.stringify(log.details || {});
    assert.equal(serialized.includes("Initial1!"), false);
    assert.equal(serialized.includes("NewPass2@"), false);
    assert.equal(serialized.includes("Reset1#"), false);
    assert.equal(serialized.toLowerCase().includes("token"), false);
    assert.equal(serialized.toLowerCase().includes("jwt"), false);
    assert.equal(serialized.toLowerCase().includes("password"), false);
}

test.before(async () => {
    await connectTestDb();

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    await Promise.all([
        AuditLog.deleteMany({}),
        Approval.deleteMany({}),
        PurchaseOrder.deleteMany({}),
        PurchaseRequest.deleteMany({}),
        Quotation.deleteMany({}),
        Vendor.deleteMany({}),
        User.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash("Initial1!", 10);

    [
        adminUser,
        departmentUser,
        financeUser,
        procurementUser,
        ceoUser,
        requesterUser,
    ] = await User.create([
        {
            fullName: "Admin User",
            email: "admin.audit@example.com",
            password: passwordHash,
            role: "admin",
            department: "Operations",
            phone: "1111111111",
        },
        {
            fullName: "Department User",
            email: "department.audit@example.com",
            password: passwordHash,
            role: "department",
            department: "Procurement",
            phone: "2222222222",
        },
        {
            fullName: "Finance User",
            email: "finance.audit@example.com",
            password: passwordHash,
            role: "finance_manager",
            department: "Finance",
            phone: "3333333333",
        },
        {
            fullName: "Procurement User",
            email: "procurement.audit@example.com",
            password: passwordHash,
            role: "procurement_manager",
            department: "Procurement",
            phone: "4444444444",
        },
        {
            fullName: "CEO User",
            email: "ceo.audit@example.com",
            password: passwordHash,
            role: "ceo",
            department: "Operations",
            phone: "5555555555",
        },
        {
            fullName: "Requester User",
            email: "requester.audit@example.com",
            password: passwordHash,
            role: "employee",
            department: "IT",
            phone: "6666666666",
        },
    ]);

    adminToken = await login("admin.audit@example.com", "Initial1!");
    departmentToken = await login("department.audit@example.com", "Initial1!");

    purchaseRequest = await purchaseRequestService.createPurchaseRequest({
        title: "Audit Laptop Request",
        description: "Procure audit laptops",
        category: "IT Equipment",
        quantity: 5,
        estimatedCost: 750000,
        requiredDate: new Date("2026-12-01"),
        requestedBy: requesterUser._id,
        remarks: "Seeded request",
    });

    await approvalService.createApproval({
        purchaseRequest: purchaseRequest._id.toString(),
        approvedBy: departmentUser._id.toString(),
        role: "department",
        decision: "Approved",
        remarks: "Department approved",
    });

    await approvalService.createApproval({
        purchaseRequest: purchaseRequest._id.toString(),
        approvedBy: financeUser._id.toString(),
        role: "finance_manager",
        decision: "Approved",
        remarks: "Finance approved",
    });

    await approvalService.createApproval({
        purchaseRequest: purchaseRequest._id.toString(),
        approvedBy: procurementUser._id.toString(),
        role: "procurement_manager",
        decision: "Approved",
        remarks: "Procurement approved",
    });

    await approvalService.createApproval({
        purchaseRequest: purchaseRequest._id.toString(),
        approvedBy: ceoUser._id.toString(),
        role: "ceo",
        decision: "Approved",
        remarks: "CEO approved",
    });

    vendor = await Vendor.create({
        companyName: "Audit Vendor",
        contactPerson: "Vendor Contact",
        email: "vendor.audit@example.com",
        phone: "7777777777",
        address: "1 Audit Street",
        category: "IT Equipment",
        taxNumber: "TAX-AUDIT-001",
        status: "Active",
    });

    quotation = await Quotation.create({
        purchaseRequest: purchaseRequest._id,
        vendor: vendor._id,
        quotedPrice: 700000,
        currency: "PKR",
        deliveryTime: 14,
        warranty: "12 months",
        remarks: "Selected quotation",
        isSelected: true,
        status: "Approved",
    });
});

test.after(async () => {
    await disconnectTestDb();
    await new Promise((resolve) => server.close(resolve));
});

test("Admin GET /api/audit-logs returns 200", async () => {
    const response = await fetch(`${baseUrl}/api/audit-logs`, {
        headers: {
            Authorization: `Bearer ${adminToken}`,
        },
    });

    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload));
    assert.ok(payload.length > 0);
});

test("Non-admin GET /api/audit-logs returns 403", async () => {
    const response = await fetch(`${baseUrl}/api/audit-logs`, {
        headers: {
            Authorization: `Bearer ${departmentToken}`,
        },
    });

    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.match(payload.message, /Access denied/i);
});

test("Login audit is stored without secrets", async () => {
    const freshToken = await login("admin.audit@example.com", "Initial1!");
    assert.ok(freshToken);

    const log = await getAuditLog("login_success");
    assert.ok(log);
    assert.equal(log.entity, "User");
    assert.equal(String(log.performedBy), String(adminUser._id));
    assertNoSecrets(log);
});

test("Password change and reset audits are stored without tokens", async () => {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "admin.audit@example.com", password: "Initial1!" }),
    });
    const loginPayload = await loginResponse.json();
    const token = loginPayload.token;

    const changeResponse = await fetch(`${baseUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: "Initial1!", newPassword: "NewPass2@" }),
    });
    const changePayload = await changeResponse.json();
    assert.equal(changeResponse.status, 200);
    assert.equal(changePayload.message, "Password changed successfully");

    const resetRequestResponse = await fetch(`${baseUrl}/api/auth/request-password-reset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "admin.audit@example.com" }),
    });
    const resetRequestPayload = await resetRequestResponse.json();
    assert.equal(resetRequestResponse.status, 200);
    assert.ok(resetRequestPayload.resetToken);

    const resetRequestLog = await getAuditLog("password_reset_requested");
    assert.ok(resetRequestLog);
    assert.equal(resetRequestLog.details.email, "admin.audit@example.com");
    assertNoSecrets(resetRequestLog);

    const resetResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetRequestPayload.resetToken, newPassword: "Reset1#" }),
    });
    const resetPayload = await resetResponse.json();
    assert.equal(resetResponse.status, 200);
    assert.equal(resetPayload.message, "Password has been reset successfully");

    const changeLog = await getAuditLog("password_changed");
    assert.ok(changeLog);
    assertNoSecrets(changeLog);

    const resetSuccessLog = await getAuditLog("password_reset_success");
    assert.ok(resetSuccessLog);
    assertNoSecrets(resetSuccessLog);
});

test("Approval, purchase request, and purchase order audits are stored", async () => {
    const approvalLog = await getAuditLog("approval_created");
    assert.ok(approvalLog);
    assert.equal(String(approvalLog.performedBy), String(ceoUser._id));
    assert.equal(approvalLog.performedByRole, "ceo");

    const requestLog = await getAuditLog("purchase_request_created");
    assert.ok(requestLog);
    assert.equal(requestLog.entity, "PurchaseRequest");
    assert.equal(String(requestLog.entityId), String(purchaseRequest._id));
    assertNoSecrets(requestLog);

    const createdPurchaseOrder = await purchaseOrderService.createPurchaseOrder({
        purchaseRequest: purchaseRequest._id.toString(),
        quotation: quotation._id.toString(),
        vendor: vendor._id.toString(),
        poNumber: "PO-AUDIT-001",
        totalAmount: 700000,
        expectedDeliveryDate: new Date("2026-12-20"),
        paymentTerms: "Net 30",
        remarks: "Audit PO",
        issuedBy: adminUser._id.toString(),
    });

    assert.ok(createdPurchaseOrder);

    await purchaseOrderService.updatePurchaseOrder(createdPurchaseOrder._id.toString(), {
        status: "Accepted",
    });

    await purchaseOrderService.cancelPurchaseOrder(createdPurchaseOrder._id.toString());

    const poCreateLog = await getAuditLog("purchase_order_created");
    assert.ok(poCreateLog);
    assert.equal(String(poCreateLog.entityId), String(createdPurchaseOrder._id));
    assertNoSecrets(poCreateLog);

    const poUpdateLog = await getAuditLog("purchase_order_updated");
    assert.ok(poUpdateLog);
    assert.equal(String(poUpdateLog.entityId), String(createdPurchaseOrder._id));

    const poCancelLog = await getAuditLog("purchase_order_cancelled");
    assert.ok(poCancelLog);
    assert.equal(String(poCancelLog.entityId), String(createdPurchaseOrder._id));
});
