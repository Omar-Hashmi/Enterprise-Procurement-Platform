const mongoose = require("mongoose");
const approvalRepository = require("../repositories/approval.repository");
const purchaseRequestRepository = require("../repositories/purchase-request.repository");
const userRepository = require("../repositories/user.repository");

const ROLE_SEQUENCE = [
    "department",
    "finance_manager",
    "procurement_manager",
    "ceo",
];

const ROLE_DISPLAY_MAP = {
    department: "Department",
    finance_manager: "Finance Manager",
    procurement_manager: "Procurement Manager",
    ceo: "CEO",
};

const ROLE_STATUS_MAP = {
    department: "Department Approved",
    finance_manager: "Finance Approved",
    procurement_manager: "Procurement Approved",
    ceo: "CEO Approved",
};

const validateApprovalSequence = ({
    currentRole,
    currentStatus,
    hasDepartmentApproval,
    hasFinanceApproval,
    hasProcurementApproval,
    hasCeoApproval,
}) => {
    if (!ROLE_SEQUENCE.includes(currentRole)) {
        return {
            allowed: false,
            message: "Invalid approver role",
        };
    }

    if (currentRole === "department") {
        if (hasDepartmentApproval) {
            return {
                allowed: false,
                message: "Duplicate department approval is not allowed",
            };
        }

        if (currentStatus !== "Pending") {
            return {
                allowed: false,
                message: "Department approval is only allowed for Pending requests",
            };
        }

        return {
            allowed: true,
            nextStatus: ROLE_STATUS_MAP.department,
        };
    }

    if (currentRole === "finance_manager") {
        if (hasFinanceApproval) {
            return {
                allowed: false,
                message: "Duplicate finance approval is not allowed",
            };
        }

        if (!hasDepartmentApproval) {
            return {
                allowed: false,
                message: "Finance approval requires Department approval first",
            };
        }

        if (currentStatus !== "Department Approved") {
            return {
                allowed: false,
                message: "Finance approval is only allowed for Department Approved requests",
            };
        }

        return {
            allowed: true,
            nextStatus: ROLE_STATUS_MAP.finance_manager,
        };
    }

    if (currentRole === "procurement_manager") {
        if (hasProcurementApproval) {
            return {
                allowed: false,
                message: "Duplicate procurement approval is not allowed",
            };
        }

        if (!hasFinanceApproval) {
            return {
                allowed: false,
                message: "Procurement approval requires Finance approval first",
            };
        }

        if (currentStatus !== "Finance Approved") {
            return {
                allowed: false,
                message: "Procurement approval is only allowed for Finance Approved requests",
            };
        }

        return {
            allowed: true,
            nextStatus: ROLE_STATUS_MAP.procurement_manager,
        };
    }

    if (currentRole === "ceo") {
        if (hasCeoApproval) {
            return {
                allowed: false,
                message: "Duplicate CEO approval is not allowed",
            };
        }

        if (!hasProcurementApproval) {
            return {
                allowed: false,
                message: "CEO approval requires Procurement approval first",
            };
        }

        if (currentStatus !== "Procurement Approved") {
            return {
                allowed: false,
                message: "CEO approval is only allowed for Procurement Approved requests",
            };
        }

        return {
            allowed: true,
            nextStatus: "Approved",
        };
    }

    return {
        allowed: false,
        message: "Invalid approval step",
    };
};

const createApproval = async (approvalData) => {

    if (!mongoose.Types.ObjectId.isValid(approvalData.purchaseRequest)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(approvalData.approvedBy)) {
        const error = new Error("Invalid approver ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.getPurchaseRequestById(
            approvalData.purchaseRequest
        );

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

    // Block approval if workflow already finished
    if (
        purchaseRequest.status === "Approved" ||
        purchaseRequest.status === "Rejected" ||
        purchaseRequest.status === "Cancelled"
    ) {
        const error = new Error(
            "Approval is no longer allowed for this purchase request"
        );
        error.statusCode = 400;
        throw error;
    }

    const approver = await userRepository.getUserById(
        approvalData.approvedBy
    );

    if (!approver) {
        const error = new Error("Approver not found");
        error.statusCode = 404;
        throw error;
    }

    if (approver.role !== approvalData.role) {
        const error = new Error(
            "Approver role does not match the requested role"
        );
        error.statusCode = 400;
        throw error;
    }

    const existingApprovals =
        await approvalRepository.getApprovalsByPurchaseRequest(
            approvalData.purchaseRequest
        );

    // Prevent duplicate approval from same role
    const duplicateApproval = existingApprovals.find(
        (approval) => approval.role === approvalData.role
    );

    if (duplicateApproval) {
        const error = new Error(
            `Duplicate ${ROLE_DISPLAY_MAP[approvalData.role]} approval is not allowed`
        );
        error.statusCode = 400;
        throw error;
    }

    const hasDepartmentApproval = existingApprovals.some(
        (approval) =>
            approval.role === "department" &&
            approval.decision === "Approved"
    );

    const hasFinanceApproval = existingApprovals.some(
        (approval) =>
            approval.role === "finance_manager" &&
            approval.decision === "Approved"
    );

    const hasProcurementApproval = existingApprovals.some(
        (approval) =>
            approval.role === "procurement_manager" &&
            approval.decision === "Approved"
    );

    const hasCeoApproval = existingApprovals.some(
        (approval) =>
            approval.role === "ceo" &&
            approval.decision === "Approved"
    );

    const decision = approvalData.decision || "Approved";

    // Only Approved / Rejected allowed
    if (
        decision !== "Approved" &&
        decision !== "Rejected"
    ) {
        const error = new Error(
            "Decision must be Approved or Rejected"
        );
        error.statusCode = 400;
        throw error;
    }

    if (decision === "Rejected") {

        await purchaseRequestRepository.updatePurchaseRequest(
            purchaseRequest._id,
            {
                status: "Rejected",
                remarks:
                    approvalData.remarks || "Rejected by approver",
            }
        );

        return await approvalRepository.createApproval({
            ...approvalData,
            decision: "Rejected",
        });
    }

    const validation = validateApprovalSequence({
        currentRole: approvalData.role,
        currentStatus: purchaseRequest.status,
        hasDepartmentApproval,
        hasFinanceApproval,
        hasProcurementApproval,
        hasCeoApproval,
    });

    if (!validation.allowed) {
        const error = new Error(validation.message);
        error.statusCode = 400;
        throw error;
    }

    const approval = await approvalRepository.createApproval({
        ...approvalData,
        decision,
    });

    await purchaseRequestRepository.updatePurchaseRequest(
        purchaseRequest._id,
        {
            status: validation.nextStatus,
        }
    );

    return approval;
};

const getAllApprovals = async () => {
    return await approvalRepository.getAllApprovals();
};

const getApprovalById = async (id) => {

    const approval = await approvalRepository.getApprovalById(id);

    if (!approval) {
        const error = new Error("Approval not found");
        error.statusCode = 404;
        throw error;
    }

    return approval;
};

const getApprovalsByPurchaseRequest = async (purchaseRequestId) => {
    return await approvalRepository.getApprovalsByPurchaseRequest(
        purchaseRequestId
    );
};

const updateApproval = async (id, updateData) => {

    const existingApproval =
        await approvalRepository.getApprovalById(id);

    if (!existingApproval) {
        const error = new Error("Approval not found");
        error.statusCode = 404;
        throw error;
    }

    if (
        existingApproval.decision === "Approved" ||
        existingApproval.decision === "Rejected"
    ) {
        const error = new Error(
            "Approved or Rejected approvals cannot be modified"
        );
        error.statusCode = 400;
        throw error;
    }

    return await approvalRepository.updateApproval(
        id,
        updateData
    );
};

module.exports = {
    createApproval,
    getAllApprovals,
    getApprovalById,
    getApprovalsByPurchaseRequest,
    updateApproval,
    validateApprovalSequence,
};