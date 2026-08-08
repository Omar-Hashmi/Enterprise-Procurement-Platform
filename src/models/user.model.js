const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: [
                "admin",
                "employee",
                "department",
                "finance_manager",
                "procurement_manager",
                "ceo",
                "vendor",
            ],
            default: "employee",
        },

        department: {
            type: String,
            enum: [
                "IT",
                "HR",
                "Finance",
                "Procurement",
                "Operations",
            ],
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;