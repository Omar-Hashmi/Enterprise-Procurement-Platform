const express = require("express");
const quotationController = require("../controllers/quotation.controller");
const {
    authenticate,
    authorize,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Create Quotation
router.post(
    "/",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.createQuotation
);

// Get All Quotations
router.get(
    "/",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.getAllQuotations
);

// Get Quotation By ID
router.get(
    "/:id",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.getQuotationById
);

// Get Quotations By Purchase Request
router.get(
    "/purchase-request/:purchaseRequestId",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.getQuotationsByPurchaseRequest
);

// Get Quotations By Vendor
router.get(
    "/vendor/:vendorId",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.getQuotationsByVendor
);

// Update Quotation
router.put(
    "/:id",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.updateQuotation
);

// Delete Quotation
router.delete(
    "/:id",
    authenticate,
    authorize(["admin", "procurement_manager"]),
    quotationController.deleteQuotation
);

module.exports = router;