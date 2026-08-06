const mongoose = require("mongoose");
const purchaseOrderRepository = require("../repositories/purchase-order.repository");

const createPurchaseOrder = async (purchaseOrderData) => {
    return await purchaseOrderRepository.createPurchaseOrder(
        purchaseOrderData
    );
};

const getAllPurchaseOrders = async () => {
    return await purchaseOrderRepository.getAllPurchaseOrders();
};

const getPurchaseOrderById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase order ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseOrder =
        await purchaseOrderRepository.getPurchaseOrderById(id);

    if (!purchaseOrder) {
        const error = new Error("Purchase order not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseOrder;
};

const updatePurchaseOrder = async (id, purchaseOrderData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase order ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseOrder =
        await purchaseOrderRepository.updatePurchaseOrder(
            id,
            purchaseOrderData
        );

    if (!purchaseOrder) {
        const error = new Error("Purchase order not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseOrder;
};

const cancelPurchaseOrder = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid purchase order ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseOrder =
        await purchaseOrderRepository.cancelPurchaseOrder(id);

    if (!purchaseOrder) {
        const error = new Error("Purchase order not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseOrder;
};

module.exports = {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    cancelPurchaseOrder,
};