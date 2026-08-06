const express = require("express");
const multer = require("multer");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const purchaseRequestRoutes = require("./routes/purchase-request.routes");
const vendorRoutes = require("./routes/vendor.routes");
const quotationRoutes = require("./routes/quotation.routes");
const purchaseOrderRoutes = require("./routes/purchase-order.routes");

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