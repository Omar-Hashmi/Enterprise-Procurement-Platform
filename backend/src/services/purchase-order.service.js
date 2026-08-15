const mongoose = require("mongoose");

const purchaseOrderRepository = require("../repositories/purchase-order.repository");
const auditLogService = require('../services/audit-log.service');

const purchaseRequestRepository = require("../repositories/purchase-request.repository");
const { rfqRepository } = require("../repositories/rfq.repository");
const { vendorRepository } = require("../repositories/vendor.repository");

const VALID_TRANSITIONS = {
    Issued: ["Accepted", "Cancelled"],
    Accepted: ["In Progress", "Cancelled"],
    "In Progress": ["Delivered", "Cancelled"],
    Delivered: ["Completed", "Cancelled"],
    Completed: [],
    Cancelled: [],
};

const validatePurchaseOrderStatusTransition = (
    currentStatus,
    nextStatus
) => {
    if (!currentStatus || !nextStatus) {
        return {
            allowed: false,
            message: "Current status and next status are required",
        };
    }

    if (currentStatus === nextStatus) {
        return {
            allowed: true,
            message: "Status unchanged",
        };
    }

    if (!VALID_TRANSITIONS[currentStatus]) {
        return {
            allowed: false,
            message: `Invalid current purchase order status: ${currentStatus}`,
        };
    }

    if (!VALID_TRANSITIONS[currentStatus].includes(nextStatus)) {
        return {
            allowed: false,
            message:
                `Invalid status transition from ${currentStatus} to ${nextStatus}`,
        };
    }

    return {
        allowed: true,
        message: "Status transition valid",
    };
};

const createPurchaseOrder = async (purchaseOrderData) => {
    if (
        !purchaseOrderData.purchaseRequest ||
        !mongoose.Types.ObjectId.isValid(
            purchaseOrderData.purchaseRequest
        )
    ) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    if (
        !purchaseOrderData.quotation ||
        !mongoose.Types.ObjectId.isValid(
            purchaseOrderData.quotation
        )
    ) {
        const error = new Error("Invalid quotation ID");
        error.statusCode = 400;
        throw error;
    }

    if (
        !purchaseOrderData.vendor ||
        !mongoose.Types.ObjectId.isValid(
            purchaseOrderData.vendor
        )
    ) {
        const error = new Error("Invalid vendor ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseRequest =
        await purchaseRequestRepository.getPurchaseRequestById(
            purchaseOrderData.purchaseRequest
        );

    if (!purchaseRequest) {
        const error = new Error("Purchase request not found");
        error.statusCode = 404;
        throw error;
    }

    if (purchaseRequest.status !== "Approved") {
        const error = new Error(
            "Purchase Order can only be created for an Approved Purchase Request"
        );
        error.statusCode = 400;
        throw error;
    }

    const quotation =
        await rfqRepository.findQuotationById(
            purchaseOrderData.quotation
        );

    if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 404;
        throw error;
    }

    const quotationPurchaseRequestId =
        quotation.purchaseRequest?._id
            ? quotation.purchaseRequest._id.toString()
            : quotation.purchaseRequest?.toString();

    if (
        quotationPurchaseRequestId !==
        purchaseOrderData.purchaseRequest.toString()
    ) {
        const error = new Error(
            "Quotation does not belong to this Purchase Request"
        );
        error.statusCode = 400;
        throw error;
    }

    if (quotation.status !== "Approved") {
        const error = new Error(
            "Only an Approved quotation can be used to create a Purchase Order"
        );
        error.statusCode = 400;
        throw error;
    }

    const quotationVendorId =
        quotation.vendor?._id
            ? quotation.vendor._id.toString()
            : quotation.vendor?.toString();

    if (
        quotationVendorId !==
        purchaseOrderData.vendor.toString()
    ) {
        const error = new Error(
            "Vendor does not match the quotation vendor"
        );
        error.statusCode = 400;
        throw error;
    }

    const vendor =
        await vendorRepository.findById(
            purchaseOrderData.vendor
        );

    if (!vendor) {
        const error = new Error("Vendor not found");
        error.statusCode = 404;
        throw error;
    }

    if (
        vendor.status &&
        vendor.status !== "Active"
    ) {
        const error = new Error("Vendor is not active");
        error.statusCode = 400;
        throw error;
    }

    const purchaseOrders =
        await purchaseOrderRepository.getAllPurchaseOrders();

    const duplicatePurchaseOrder =
        purchaseOrders.find((purchaseOrder) => {
            const existingPurchaseRequestId =
                purchaseOrder.purchaseRequest?._id
                    ? purchaseOrder.purchaseRequest._id.toString()
                    : purchaseOrder.purchaseRequest?.toString();

            return (
                existingPurchaseRequestId ===
                purchaseOrderData.purchaseRequest.toString()
            );
        });

    if (duplicatePurchaseOrder) {
        const error = new Error(
            "Purchase Order already exists for this Purchase Request"
        );
        error.statusCode = 400;
        throw error;
    }

    const createdPurchaseOrder = await purchaseOrderRepository.createPurchaseOrder({
        ...purchaseOrderData,
        status: "Issued",
        issuedAt: new Date(),
    });
    // Log purchase order creation
    await auditLogService.log({
        action: "purchase_order_created",
        entity: "PurchaseOrder",
        entityId: createdPurchaseOrder._id,
        performedBy: purchaseOrderData.issuedBy,
        performedByRole: null, // role can be derived from user if needed
        ipAddress: null,
        details: { purchaseOrder: createdPurchaseOrder },
    });
    return createdPurchaseOrder;
};

const getAllPurchaseOrders = async () => {
    return await purchaseOrderRepository.getAllPurchaseOrders();
};

const getPurchaseOrderById = async (id) => {
    if (
        !id ||
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        const error = new Error("Invalid Purchase Order ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseOrder =
        await purchaseOrderRepository.getPurchaseOrderById(id);

    if (!purchaseOrder) {
        const error = new Error("Purchase Order not found");
        error.statusCode = 404;
        throw error;
    }

    return purchaseOrder;
};

const updatePurchaseOrder = async (
    id,
    purchaseOrderData
) => {
    if (
        !id ||
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        const error = new Error("Invalid Purchase Order ID");
        error.statusCode = 400;
        throw error;
    }

    const existingPurchaseOrder =
        await purchaseOrderRepository.getPurchaseOrderById(id);

    if (!existingPurchaseOrder) {
        const error = new Error("Purchase Order not found");
        error.statusCode = 404;
        throw error;
    }

    delete purchaseOrderData.purchaseRequest;
    delete purchaseOrderData.vendor;
    delete purchaseOrderData.quotation;
    delete purchaseOrderData.poNumber;
    delete purchaseOrderData.totalAmount;
    delete purchaseOrderData.issuedAt;

    if (purchaseOrderData.status) {
        const validation =
            validatePurchaseOrderStatusTransition(
                existingPurchaseOrder.status,
                purchaseOrderData.status
            );

        if (!validation.allowed) {
            const error = new Error(validation.message);
            error.statusCode = 400;
            throw error;
        }

        switch (purchaseOrderData.status) {
            case "Accepted":
                purchaseOrderData.acceptedAt = new Date();
                break;

            case "In Progress":
                purchaseOrderData.inProgressAt = new Date();
                break;

            case "Delivered":
                purchaseOrderData.deliveredAt = new Date();
                break;

            case "Completed":
                purchaseOrderData.completedAt = new Date();
                break;

            case "Cancelled":
                purchaseOrderData.cancelledAt = new Date();
                break;
        }
    }

    const updatedPurchaseOrder =
        await purchaseOrderRepository.updatePurchaseOrder(
            id,
            purchaseOrderData
        );

    if (!updatedPurchaseOrder) {
        const error = new Error("Purchase Order not found");
        error.statusCode = 404;
        throw error;
    }

    // Log purchase order update
    await auditLogService.log({
        action: "purchase_order_updated",
        entity: "PurchaseOrder",
        entityId: updatedPurchaseOrder._id,
        performedBy: null, // caller should provide actor; not available here
        performedByRole: null,
        ipAddress: null,
        details: { before: null, after: updatedPurchaseOrder },
    });
    return updatedPurchaseOrder;
};

const cancelPurchaseOrder = async (id) => {
    if (
        !id ||
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        const error = new Error("Invalid Purchase Order ID");
        error.statusCode = 400;
        throw error;
    }

    const purchaseOrder =
        await purchaseOrderRepository.getPurchaseOrderById(id);

    if (!purchaseOrder) {
        const error = new Error("Purchase Order not found");
        error.statusCode = 404;
        throw error;
    }

    const validation =
        validatePurchaseOrderStatusTransition(
            purchaseOrder.status,
            "Cancelled"
        );

    if (!validation.allowed) {
        const error = new Error(validation.message);
        error.statusCode = 400;
        throw error;
    }

    const cancelledPurchaseOrder =
        await purchaseOrderRepository.updatePurchaseOrder(
            id,
            {
                status: "Cancelled",
                cancelledAt: new Date(),
            }
        );

    if (!cancelledPurchaseOrder) {
        const error = new Error("Purchase Order not found");
        error.statusCode = 404;
        throw error;
    }

    // Log purchase order cancellation
    await auditLogService.log({
        action: "purchase_order_cancelled",
        entity: "PurchaseOrder",
        entityId: cancelledPurchaseOrder._id,
        performedBy: null,
        performedByRole: null,
        ipAddress: null,
        details: { before: purchaseOrder, after: cancelledPurchaseOrder },
    });
    return cancelledPurchaseOrder;
};

module.exports = {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    cancelPurchaseOrder,
    validatePurchaseOrderStatusTransition,
};