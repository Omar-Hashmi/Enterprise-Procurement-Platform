const PurchaseOrder = require("../models/purchase-order.model");

const createPurchaseOrder = async (purchaseOrderData) => {
    const purchaseOrder = await PurchaseOrder.create(purchaseOrderData);

    return purchaseOrder;
};

const getAllPurchaseOrders = async () => {
    const purchaseOrders = await PurchaseOrder.find()
        .populate("purchaseRequest")
        .populate("vendor")
        .populate("issuedBy", "fullName email role");

    return purchaseOrders;
};

const getPurchaseOrderById = async (id) => {
    const purchaseOrder = await PurchaseOrder.findById(id)
        .populate("purchaseRequest")
        .populate("vendor")
        .populate("issuedBy", "fullName email role");

    return purchaseOrder;
};

const updatePurchaseOrder = async (id, purchaseOrderData) => {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
        id,
        purchaseOrderData,
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("purchaseRequest")
        .populate("vendor")
        .populate("issuedBy", "fullName email role");

    return purchaseOrder;
};

const cancelPurchaseOrder = async (id) => {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
        id,
        {
            status: "Cancelled",
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("purchaseRequest")
        .populate("vendor")
        .populate("issuedBy", "fullName email role");

    return purchaseOrder;
};

module.exports = {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    cancelPurchaseOrder,
};