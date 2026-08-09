const approvalService = require("../services/approval.service");

const createApproval = async (req, res) => {
    try {
        const approval = await approvalService.createApproval(req.body);

        res.status(201).json({
            message: "Approval created successfully",
            approval,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getAllApprovals = async (req, res) => {
    try {
        const approvals = await approvalService.getAllApprovals();

        res.status(200).json(approvals);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getApprovalById = async (req, res) => {
    try {
        const approval = await approvalService.getApprovalById(req.params.id);

        res.status(200).json(approval);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getApprovalsByPurchaseRequest = async (req, res) => {
    try {
        const approvals =
            await approvalService.getApprovalsByPurchaseRequest(
                req.params.purchaseRequestId
            );

        res.status(200).json(approvals);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const updateApproval = async (req, res) => {
    try {
        const approval = await approvalService.updateApproval(
            req.params.id,
            req.body
        );

        res.status(200).json({
            message: "Approval updated successfully",
            approval,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createApproval,
    getAllApprovals,
    getApprovalById,
    getApprovalsByPurchaseRequest,
    updateApproval,
};