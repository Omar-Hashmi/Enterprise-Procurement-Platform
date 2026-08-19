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
                "department_manager",
                "finance_manager",
                "finance_officer",
                "procurement_manager",
                "procurement_officer",
                "warehouse_staff",
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
                "Executive",
            ],
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
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