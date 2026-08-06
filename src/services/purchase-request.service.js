const mongoose = require("mongoose");
const purchaseRequestRepository = require("../repositories/purchase-request.repository");

const createPurchaseRequest = async (requestData) => {
    return await purchaseRequestRepository.createPurchaseRequest(requestData);
};

const getAllPurchaseRequests = async () => {
    return await purchaseRequestRepository.getAllPurchaseRequests();
};

const getPurchaseRequestById = async (id) => {
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

const updatePurchaseRequest = async (id, requestData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.updatePurchaseRequest(
            id,
            requestData
        );

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseRequest;
};

const cancelPurchaseRequest = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.cancelPurchaseRequest(id);

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseRequest;
};

// ⭐ Upload Attachment
const uploadAttachment = async (id, file) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    if (!file) {
        const error = new Error("Attachment is required");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.uploadAttachment(
            id,
            file.path
        );

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

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