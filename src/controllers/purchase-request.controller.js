const purchaseRequestService = require("../services/purchase-request.service");

const createPurchaseRequest = async (req, res) => {
    try {
        const requestData = {
            ...req.body,
            requestedBy: req.user.userId,
        };

        const purchaseRequest =
            await purchaseRequestService.createPurchaseRequest(requestData);

        return res.status(201).json({
            message: "Purchase request created successfully",
            purchaseRequest,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getAllPurchaseRequests = async (req, res) => {
    try {
        const purchaseRequests =
            await purchaseRequestService.getAllPurchaseRequests();

        return res.status(200).json(purchaseRequests);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getPurchaseRequestById = async (req, res) => {
    try {
        const purchaseRequest =
            await purchaseRequestService.getPurchaseRequestById(req.params.id);

        return res.status(200).json(purchaseRequest);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// ⭐ Track Purchase Request Status
const getPurchaseRequestStatus = async (req, res) => {
    try {
        const status =
            await purchaseRequestService.getPurchaseRequestStatus(
                req.params.id
            );

        return res.status(200).json({
            message: "Purchase request status fetched successfully",
            status,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const updatePurchaseRequest = async (req, res) => {
    try {
        const purchaseRequest =
            await purchaseRequestService.updatePurchaseRequest(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            message: "Purchase request updated successfully",
            purchaseRequest,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const cancelPurchaseRequest = async (req, res) => {
    try {
        const purchaseRequest =
            await purchaseRequestService.cancelPurchaseRequest(req.params.id);

        return res.status(200).json({
            message: "Purchase request cancelled successfully",
            purchaseRequest,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// ⭐ Upload Attachment
const uploadAttachment = async (req, res) => {
    try {
        const purchaseRequest =
            await purchaseRequestService.uploadAttachment(
                req.params.id,
                req.file
            );

        return res.status(200).json({
            message: "Attachment uploaded successfully",
            purchaseRequest,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createPurchaseRequest,
    getAllPurchaseRequests,
    getPurchaseRequestById,
    getPurchaseRequestStatus,
    updatePurchaseRequest,
    cancelPurchaseRequest,
    uploadAttachment,
};