const express = require("express");
const userController = require("../controllers/user.controller");
const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Get All Users (Admin only)
router.get(
    "/",
    authenticate,
    authorize(["admin"]),
    userController.getAllUsers
);

// Get User By ID (Any authenticated user for their own profile, or admin)
router.get(
    "/:id",
    authenticate,
    userController.getUserById
);

// Update User (Self or Admin)
router.put(
    "/:id",
    authenticate,
    userController.updateUser
);

// Soft Delete User (Admin only)
router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    userController.softDeleteUser
);

// Activate User (Admin only)
router.patch(
    "/:id/activate",
    authenticate,
    authorize(["admin"]),
    userController.activateUser
);

module.exports = router;