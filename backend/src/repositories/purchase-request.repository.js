const PurchaseRequest = require("../models/purchase-request.model");

const createPurchaseRequest = async (requestData) => {
    const purchaseRequest = await PurchaseRequest.create(requestData);

    return purchaseRequest;
};

const getAllPurchaseRequests = async () => {
    const purchaseRequests = await PurchaseRequest.find().populate(
        "requestedBy",
        "fullName email role"
    );

    return purchaseRequests;
};

const getPurchaseRequestById = async (id) => {
    const purchaseRequest = await PurchaseRequest.findById(id).populate(
        "requestedBy",
        "fullName email role"
    );

    return purchaseRequest;
};

// ⭐ Track Purchase Request Status
const getPurchaseRequestStatus = async (id) => {
    const purchaseRequest = await PurchaseRequest.findById(id).select(
        "title status remarks updatedAt"
    );

    return purchaseRequest;
};

const updatePurchaseRequest = async (id, requestData) => {
    const purchaseRequest = await PurchaseRequest.findByIdAndUpdate(
        id,
        requestData,
        {
            new: true,
            runValidators: true,
        }
    ).populate("requestedBy", "fullName email role");

    return purchaseRequest;
};

const cancelPurchaseRequest = async (id) => {
    const purchaseRequest = await PurchaseRequest.findByIdAndUpdate(
        id,
        {
            status: "Cancelled",
        },
        {
            new: true,
            runValidators: true,
        }
    ).populate("requestedBy", "fullName email role");

    return purchaseRequest;
};

// ⭐ Upload Attachment
const uploadAttachment = async (id, filePath) => {
    const purchaseRequest = await PurchaseRequest.findByIdAndUpdate(
        id,
        {
            $push: {
                attachments: filePath,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).populate("requestedBy", "fullName email role");

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