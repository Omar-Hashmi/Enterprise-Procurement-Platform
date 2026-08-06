const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
    {
        purchaseRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseRequest",
            required: true,
        },

        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },

        quotedPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            enum: ["PKR", "USD"],
            default: "PKR",
        },

        deliveryTime: {
            type: Number,
            required: true,
            min: 1,
        },

        warranty: {
            type: String,
            default: "No Warranty",
        },

        remarks: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;