const express = require("express");
const authController = require("../controllers/auth.controller");
const {
    authenticate,
} = require("../middleware/auth.middleware");
const { validateRegister, validateLogin } = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/profile", authenticate, authController.profile);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
module.exports = router;