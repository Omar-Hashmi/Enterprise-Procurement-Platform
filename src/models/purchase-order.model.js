const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
    {
        purchaseRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseRequest",
            required: true,
        },
        quotation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quotation",
            required: true,
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        poNumber: {
            type: String,
            required: true,
            unique: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        expectedDeliveryDate: {
            type: Date,
            required: true,
        },
        remarks: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: [
                "Issued",
                "Accepted",
                "In Progress",
                "Delivered",
                "Completed",
                "Cancelled",
            ],
            default: "Issued",
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        acceptedAt: {
            type: Date,
        },
        inProgressAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const PurchaseOrder = mongoose.model(
    "PurchaseOrder",
    purchaseOrderSchema
);

module.exports = PurchaseOrder;