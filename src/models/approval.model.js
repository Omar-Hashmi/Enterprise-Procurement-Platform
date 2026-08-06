const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
    {
        purchaseRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseRequest",
            required: true,
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            enum: [
                "procurement_manager",
                "finance",
                "admin",
            ],
            required: true,
        },

        decision: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",
            ],
            default: "Pending",
        },

        remarks: {
            type: String,
            default: "",
        },

        approvedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Approval = mongoose.model("Approval", approvalSchema);

module.exports = Approval;