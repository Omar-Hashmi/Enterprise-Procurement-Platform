const approvalRepository = require("../repositories/approval.repository");

const createApproval = async (approvalData) => {
    return await approvalRepository.createApproval(approvalData);
};

const getAllApprovals = async () => {
    return await approvalRepository.getAllApprovals();
};

const getApprovalById = async (id) => {
    const approval = await approvalRepository.getApprovalById(id);

    if (!approval) {
        throw new Error("Approval not found");
    }

    return approval;
};

const getApprovalsByPurchaseRequest = async (purchaseRequestId) => {
    return await approvalRepository.getApprovalsByPurchaseRequest(
        purchaseRequestId
    );
};

const updateApproval = async (id, updateData) => {
    const approval = await approvalRepository.updateApproval(id, updateData);

    if (!approval) {
        throw new Error("Approval not found");
    }

    return approval;
};

module.exports = {
    createApproval,
    getAllApprovals,
    getApprovalById,
    getApprovalsByPurchaseRequest,
    updateApproval,
};