const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

// Protected Route
router.get("/profile", authenticate, authController.profile);

module.exports = router;