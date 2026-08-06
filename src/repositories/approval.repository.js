const Approval = require("../models/approval.model");

const createApproval = async (approvalData) => {
    return await Approval.create(approvalData);
};

const getAllApprovals = async () => {
    return await Approval.find()
        .populate("purchaseRequest")
        .populate("approvedBy", "fullName email role");
};

const getApprovalById = async (id) => {
    return await Approval.findById(id)
        .populate("purchaseRequest")
        .populate("approvedBy", "fullName email role");
};

const getApprovalsByPurchaseRequest = async (purchaseRequestId) => {
    return await Approval.find({
        purchaseRequest: purchaseRequestId,
    }).populate("approvedBy", "fullName email role");
};

const updateApproval = async (id, updateData) => {
    return await Approval.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("purchaseRequest")
        .populate("approvedBy", "fullName email role");
};

module.exports = {
    createApproval,
    getAllApprovals,
    getApprovalById,
    getApprovalsByPurchaseRequest,
    updateApproval,
};