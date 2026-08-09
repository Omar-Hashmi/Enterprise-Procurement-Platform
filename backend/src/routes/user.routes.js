const express = require("express");
const userController = require("../controllers/user.controller");
const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const router = express.Router();

// Get All Users
router.get(
    "/",
    authenticate,
    authorize(["admin", "employee"]),
    userController.getAllUsers
);

// Get User By ID
router.get(
    "/:id",
    authenticate,
    authorize(["admin", "employee"]),
    userController.getUserById
);

// Update User
router.put(
    "/:id",
    authenticate,
    authorize(["admin", "employee"]),
    userController.updateUser
);

// Soft Delete User (Deactivate)
router.delete(
    "/:id",
    authenticate,
    authorize(["admin", "employee"]),
    userController.softDeleteUser
);

// Activate User
router.patch(
    "/:id/activate",
    authenticate,
    authorize(["admin", "employee"]),
    userController.activateUser
);

module.exports = router;