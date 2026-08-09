const purchaseOrderService = require("../services/purchase-order.service");

const createPurchaseOrder = async (req, res) => {
    try {
        const purchaseOrderData = {
            ...req.body,
            issuedBy: req.user.userId,
        };

        const purchaseOrder =
            await purchaseOrderService.createPurchaseOrder(
                purchaseOrderData
            );

        return res.status(201).json({
            message: "Purchase order created successfully",
            purchaseOrder,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getAllPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders =
            await purchaseOrderService.getAllPurchaseOrders();

        return res.status(200).json(purchaseOrders);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const getPurchaseOrderById = async (req, res) => {
    try {
        const purchaseOrder =
            await purchaseOrderService.getPurchaseOrderById(
                req.params.id
            );

        return res.status(200).json(purchaseOrder);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const updatePurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder =
            await purchaseOrderService.updatePurchaseOrder(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            message: "Purchase order updated successfully",
            purchaseOrder,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

const cancelPurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder =
            await purchaseOrderService.cancelPurchaseOrder(
                req.params.id
            );

        return res.status(200).json({
            message: "Purchase order cancelled successfully",
            purchaseOrder,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    cancelPurchaseOrder,
};