const quotationService = require("../services/quotation.service");

// Create Quotation
const createQuotation = async (req, res) => {
    try {
        const quotation = await quotationService.createQuotation(req.body);

        return res.status(201).json({
            message: "Quotation created successfully",
            quotation,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Get All Quotations
const getAllQuotations = async (req, res) => {
    try {
        const quotations = await quotationService.getAllQuotations();

        return res.status(200).json(quotations);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Get Quotation By ID
const getQuotationById = async (req, res) => {
    try {
        const quotation = await quotationService.getQuotationById(req.params.id);

        return res.status(200).json(quotation);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Get Quotations By Purchase Request
const getQuotationsByPurchaseRequest = async (req, res) => {
    try {
        const quotations =
            await quotationService.getQuotationsByPurchaseRequest(
                req.params.purchaseRequestId
            );

        return res.status(200).json(quotations);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Get Quotations By Vendor
const getQuotationsByVendor = async (req, res) => {
    try {
        const quotations =
            await quotationService.getQuotationsByVendor(
                req.params.vendorId
            );

        return res.status(200).json(quotations);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Update Quotation
const updateQuotation = async (req, res) => {
    try {
        const quotation = await quotationService.updateQuotation(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            message: "Quotation updated successfully",
            quotation,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Delete Quotation
const deleteQuotation = async (req, res) => {
    try {
        await quotationService.deleteQuotation(req.params.id);

        return res.status(200).json({
            message: "Quotation deleted successfully",
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
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