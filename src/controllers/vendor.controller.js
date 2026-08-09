const vendorService = require("../services/vendor.service");

// Create Vendor
const createVendor = async (req, res) => {
    try {
        const vendor = await vendorService.createVendor(req.body);

        return res.status(201).json({
            message: "Vendor created successfully",
            vendor,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Get All Vendors
const getAllVendors = async (req, res) => {
    try {
        const vendors = await vendorService.getAllVendors();

        return res.status(200).json(vendors);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Get Vendor By ID
const getVendorById = async (req, res) => {
    try {
        const vendor = await vendorService.getVendorById(req.params.id);

        return res.status(200).json(vendor);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Update Vendor
const updateVendor = async (req, res) => {
    try {
        const vendor = await vendorService.updateVendor(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            message: "Vendor updated successfully",
            vendor,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

// Delete Vendor (Soft Delete)
const deleteVendor = async (req, res) => {
    try {
        const vendor = await vendorService.deleteVendor(req.params.id);

        return res.status(200).json({
            message: "Vendor deactivated successfully",
            vendor,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
};