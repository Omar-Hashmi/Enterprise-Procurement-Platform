const express = require("express");
const vendorController = require("../controllers/vendor.controller");
const {
    authenticate,
    authorize,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Create Vendor
router.post(
    "/",
    authenticate,
    authorize(["admin"]),
    vendorController.createVendor
);

// Get All Vendors
router.get(
    "/",
    authenticate,
    authorize(["admin", "employee"]),
    vendorController.getAllVendors
);

// Get Vendor By ID
router.get(
    "/:id",
    authenticate,
    authorize(["admin", "employee"]),
    vendorController.getVendorById
);

// Update Vendor
router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    vendorController.updateVendor
);

// Delete (Deactivate) Vendor
router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    vendorController.deleteVendor
);

module.exports = router;