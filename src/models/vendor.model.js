const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        contactPerson: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "IT Equipment",
                "Office Supplies",
                "Furniture",
                "Stationery",
                "Electronics",
                "Networking",
                "Software",
                "Services",
                "Other",
            ],
        },

        taxNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Vendor", vendorSchema);