const mongoose = require("mongoose");
const quotationRepository = require("../repositories/quotation.repository");

// Create Quotation
const createQuotation = async (quotationData) => {
    return await quotationRepository.createQuotation(quotationData);
};

// Get All Quotations
const getAllQuotations = async () => {
    return await quotationRepository.getAllQuotations();
};

// Get Quotation By ID
const getQuotationById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid quotation ID");
        error.statusCode = 400;
        throw error;
    }

    const quotation = await quotationRepository.getQuotationById(id);

    if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 404;
        throw error;
    }

    return quotation;
};

// Get Quotations By Purchase Request
const getQuotationsByPurchaseRequest = async (purchaseRequestId) => {
    if (!mongoose.Types.ObjectId.isValid(purchaseRequestId)) {
        const error = new Error("Invalid purchase request ID");
        error.statusCode = 400;
        throw error;
    }

    return await quotationRepository.getQuotationsByPurchaseRequest(
        purchaseRequestId
    );
};

// Get Quotations By Vendor
const getQuotationsByVendor = async (vendorId) => {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        const error = new Error("Invalid vendor ID");
        error.statusCode = 400;
        throw error;
    }

    return await quotationRepository.getQuotationsByVendor(vendorId);
};

// Update Quotation
const updateQuotation = async (id, quotationData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid quotation ID");
        error.statusCode = 400;
        throw error;
    }

    const quotation = await quotationRepository.updateQuotation(
        id,
        quotationData
    );

    if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 404;
        throw error;
    }

    return quotation;
};

// Delete Quotation
const deleteQuotation = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid quotation ID");
        error.statusCode = 400;
        throw error;
    }

    const quotation = await quotationRepository.deleteQuotation(id);

    if (!quotation) {
        const error = new Error("Quotation not found");
        error.statusCode = 404;
        throw error;
    }

    return quotation;
};

module.exports = {
    createQuotation,
    getAllQuotations,
    getQuotationById,
    getQuotationsByPurchaseRequest,
    getQuotationsByVendor,
    updateQuotation,
    deleteQuotation,
};