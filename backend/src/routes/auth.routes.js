const express = require("express");
const authController = require("../controllers/auth.controller");
const {
    authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authenticate, authController.profile);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
module.exports = router;