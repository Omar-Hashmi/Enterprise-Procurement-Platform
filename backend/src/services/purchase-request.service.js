const mongoose = require("mongoose");
const purchaseRequestRepository = require("../repositories/purchase-request.repository");

const auditLogService = require('../services/audit-log.service');

const createPurchaseRequest = async (requestData) => {
    const purchaseRequest = await purchaseRequestRepository.createPurchaseRequest(requestData);
    await auditLogService.log({
        action: "purchase_request_created",
        entity: "PurchaseRequest",
        entityId: purchaseRequest._id,
        performedBy: requestData.requestedBy || null,
        performedByRole: null,
        ipAddress: null,
        details: { requestData },
    });
    return purchaseRequest;
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

    const updatedPurchaseRequest = await purchaseRequestRepository.updatePurchaseRequest(
        existingRequest._id,
        requestData
    );

    // Log update event
    await auditLogService.log({
        action: "purchase_request_updated",
        entity: "PurchaseRequest",
        entityId: updatedPurchaseRequest._id,
        performedBy: user.userId,
        performedByRole: user.role,
        ipAddress: null,
        details: { before: existingRequest, after: updatedPurchaseRequest }
    });

    return updatedPurchaseRequest;
};

const cancelPurchaseRequest = async (id, user) => {
    const existingRequest = await getPurchaseRequestById(id, user);

    const cancelledPurchaseRequest = await purchaseRequestRepository.cancelPurchaseRequest(
        existingRequest._id
    );

    // Log cancellation
    await auditLogService.log({
        action: "purchase_request_cancelled",
        entity: "PurchaseRequest",
        entityId: cancelledPurchaseRequest._id,
        performedBy: user.userId,
        performedByRole: user.role,
        ipAddress: null,
        details: { before: existingRequest, after: cancelledPurchaseRequest }
    });

    return cancelledPurchaseRequest;
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