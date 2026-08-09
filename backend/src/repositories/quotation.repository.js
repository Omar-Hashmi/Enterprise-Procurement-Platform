const Quotation = require("../models/quotation.model");

// Create Quotation
const createQuotation = async (quotationData) => {
    return await Quotation.create(quotationData);
};

// Get All Quotations
const getAllQuotations = async () => {
    return await Quotation.find()
        .populate("purchaseRequest")
        .populate("vendor");
};

// Get Quotation By ID
const getQuotationById = async (id) => {
    return await Quotation.findById(id)
        .populate("purchaseRequest")
        .populate("vendor");
};

// Get Quotations By Purchase Request
const getQuotationsByPurchaseRequest = async (purchaseRequestId) => {
    return await Quotation.find({
        purchaseRequest: purchaseRequestId,
    }).populate("vendor");
};

// Get Quotations By Vendor
const getQuotationsByVendor = async (vendorId) => {
    return await Quotation.find({
        vendor: vendorId,
    }).populate("purchaseRequest");
};

// Update Quotation
const updateQuotation = async (id, quotationData) => {
    return await Quotation.findByIdAndUpdate(
        id,
        quotationData,
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("purchaseRequest")
        .populate("vendor");
};

// Delete Quotation
const deleteQuotation = async (id) => {
    return await Quotation.findByIdAndDelete(id);
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