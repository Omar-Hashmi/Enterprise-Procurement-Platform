const mongoose = require("mongoose");
const Vendor = require("../models/vendor.model");
const vendorRepository = require("../repositories/vendor.repository");

// Create Vendor
const createVendor = async (vendorData) => {
    // Check duplicate email
    const existingEmail = await Vendor.findOne({
        email: vendorData.email,
    });

    if (existingEmail) {
        const error = new Error("Vendor email already exists");
        error.statusCode = 400;
        throw error;
    }

    // Check duplicate tax number
    const existingTaxNumber = await Vendor.findOne({
        taxNumber: vendorData.taxNumber,
    });

    if (existingTaxNumber) {
        const error = new Error("Tax number already exists");
        error.statusCode = 400;
        throw error;
    }

    return await vendorRepository.createVendor(vendorData);
};

// Get All Vendors
const getAllVendors = async () => {
    return await vendorRepository.getAllVendors();
};

// Get Vendor By ID
const getVendorById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid vendor ID");
        error.statusCode = 400;
        throw error;
    }

    const vendor = await vendorRepository.getVendorById(id);

    if (!vendor) {
        const error = new Error("Vendor not found");
        error.statusCode = 404;
        throw error;
    }

    return vendor;
};

// Update Vendor
const updateVendor = async (id, vendorData) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid vendor ID");
        error.statusCode = 400;
        throw error;
    }

    const vendor = await vendorRepository.updateVendor(id, vendorData);

    if (!vendor) {
        const error = new Error("Vendor not found");
        error.statusCode = 404;
        throw error;
    }

    return vendor;
};

// Delete Vendor (Soft Delete)
const deleteVendor = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid vendor ID");
        error.statusCode = 400;
        throw error;
    }

    const vendor = await vendorRepository.deleteVendor(id);

    if (!vendor) {
        const error = new Error("Vendor not found");
        error.statusCode = 404;
        throw error;
    }

    return vendor;
};

module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
};