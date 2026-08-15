const express = require("express");
const purchaseRequestController = require("../controllers/purchase-request.controller");
const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { validateCreatePurchaseRequest } = require("../validations/purchase-request.validation");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Debug Upload Route (Temporary)
|--------------------------------------------------------------------------
*/
router.post(
    "/test-upload",
    upload.single("attachment"),
    (req, res) => {
        console.log("File Received:", req.file);

        return res.status(200).json({
            message: "Upload working successfully",
            file: req.file,
        });
    }
);

/*
|--------------------------------------------------------------------------
| Purchase Request Routes
|--------------------------------------------------------------------------
*/

// Create Purchase Request
router.post(
    "/",
    authenticate,
    authorize(["employee", "admin"]),
    validateCreatePurchaseRequest,
    purchaseRequestController.createPurchaseRequest
);

// Get All Purchase Requests
router.get(
    "/",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.getAllPurchaseRequests
);

// ⭐ Track Purchase Request Status
router.get(
    "/:id/status",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.getPurchaseRequestStatus
);

// Get Purchase Request By ID
router.get(
    "/:id",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.getPurchaseRequestById
);

// Update Purchase Request
router.put(
    "/:id",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.updatePurchaseRequest
);

// Cancel Purchase Request
router.patch(
    "/:id/cancel",
    authenticate,
    authorize(["employee", "admin"]),
    purchaseRequestController.cancelPurchaseRequest
);

// Upload Attachment
router.post(
    "/:id/upload",
    authenticate,
    authorize(["employee", "admin"]),
    upload.single("attachment"),
    purchaseRequestController.uploadAttachment
);

module.exports = router;