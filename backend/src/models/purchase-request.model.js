const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        estimatedCost: {
            type: Number,
            required: true,
            min: 0,
        },

        requiredDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Department Approved",
                "Finance Approved",
                "Procurement Approved",
                "CEO Approved",
                "Approved",
                "Rejected",
                "Cancelled",
            ],
            default: "Pending",
        },

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        attachments: [
            {
                type: String,
            },
        ],

        remarks: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "PurchaseRequest",
    purchaseRequestSchema
);