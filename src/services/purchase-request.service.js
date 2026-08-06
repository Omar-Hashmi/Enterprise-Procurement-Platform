const mongoose = require("mongoose");
const purchaseRequestRepository = require("../repositories/purchase-request.repository");

const createPurchaseRequest = async (requestData) => {
    return await purchaseRequestRepository.createPurchaseRequest(requestData);
};

const getAllPurchaseRequests = async () => {
    return await purchaseRequestRepository.getAllPurchaseRequests();
};

const getPurchaseRequestById = async (id, user) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.getPurchaseRequestById(id);

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

    // ⭐ Ownership Validation
    if (
        user.role !== "admin" &&
        purchaseRequest.requestedBy._id.toString() !== user.userId
    ) {
        const error = new Error(
            "You are not authorized to access this purchase request"
        );
        error.statusCode = 403;
        throw error;
    }

    return purchaseRequest;
};

// ⭐ Track Purchase Request Status
const getPurchaseRequestStatus = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.getPurchaseRequestStatus(id);

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseRequest;
};

const updatePurchaseRequest = async (id, requestData, user) => {
    const existingRequest = await getPurchaseRequestById(id, user);

    const purchaseRequest =
        await purchaseRequestRepository.updatePurchaseRequest(
            existingRequest._id,
            requestData
        );

    return purchaseRequest;
};

const cancelPurchaseRequest = async (id, user) => {
    const existingRequest = await getPurchaseRequestById(id, user);

    const purchaseRequest =
        await purchaseRequestRepository.cancelPurchaseRequest(
            existingRequest._id
        );

    return purchaseRequest;
};

// ⭐ Upload Attachment
const uploadAttachment = async (id, file, user) => {
    if (!file) {
        const error = new Error("Attachment is required");
        error.statusCode = 400;
        throw error;
    }

    const existingRequest = await getPurchaseRequestById(id, user);

    const purchaseRequest =
        await purchaseRequestRepository.uploadAttachment(
            existingRequest._id,
            file.path
        );

    return purchaseRequest;
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