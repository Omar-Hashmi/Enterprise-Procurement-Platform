const express = require("express");
const multer = require("multer");

const approvalRoutes = require("./routes/approval.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const purchaseRequestRoutes = require("./routes/purchase-request.routes");
const vendorRoutes = require("./routes/vendor.routes");
const quotationRoutes = require("./routes/RFQ.routes");
const purchaseOrderRoutes = require("./routes/purchase-order.routes");
const auditLogRoutes = require("./routes/audit-log.routes");

// Developer 2 — Vendor & Business Operations
const budgetRoutes = require("./routes/budget.routes");
const contractRoutes = require("./routes/contract.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Enterprise Procurement Platform API is Running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Developer 2 — Vendor & Business Operations
app.use("/api/budgets", budgetRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: "File upload error",
            error: err.code,
            detail: err.message,
        });
    }

    if (err) {
        return res.status(400).json({
            message: "Upload failed",
            error: err.message,
        });
    }

    next();
});

module.exports = app;