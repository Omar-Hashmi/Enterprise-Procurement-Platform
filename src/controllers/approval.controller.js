const approvalService = require("../services/approval.service");

const createApproval = async (req, res, next) => {
    try {
        const approval = await approvalService.createApproval(req.body);

        res.status(201).json({
            message: "Approval created successfully",
            approval,
        });
    } catch (error) {
        next(error);
    }
};

const getAllApprovals = async (req, res, next) => {
    try {
        const approvals = await approvalService.getAllApprovals();

        res.status(200).json(approvals);
    } catch (error) {
        next(error);
    }
};

const getApprovalById = async (req, res, next) => {
    try {
        const approval = await approvalService.getApprovalById(req.params.id);

        res.status(200).json(approval);
    } catch (error) {
        next(error);
    }
};

const getApprovalsByPurchaseRequest = async (req, res, next) => {
    try {
        const approvals =
            await approvalService.getApprovalsByPurchaseRequest(
                req.params.purchaseRequestId
            );

        res.status(200).json(approvals);
    } catch (error) {
        next(error);
    }
};

const updateApproval = async (req, res, next) => {
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
        next(error);
    }
};

module.exports = {
    createApproval,
    getAllApprovals,
    getApprovalById,
    getApprovalsByPurchaseRequest,
    updateApproval,
};