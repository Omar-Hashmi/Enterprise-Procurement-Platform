const Vendor = require("../models/vendor.model");

// Create Vendor
const createVendor = async (vendorData) => {
    const vendor = await Vendor.create(vendorData);

    return vendor;
};

// Get All Vendors
const getAllVendors = async () => {
    const vendors = await Vendor.find();

    return vendors;
};

// Get Vendor By ID
const getVendorById = async (id) => {
    const vendor = await Vendor.findById(id);

    return vendor;
};

// Update Vendor
const updateVendor = async (id, vendorData) => {
    const vendor = await Vendor.findByIdAndUpdate(
        id,
        vendorData,
        {
            new: true,
            runValidators: true,
        }
    );

    return vendor;
};

// Delete (Deactivate) Vendor
const deleteVendor = async (id) => {
    const vendor = await Vendor.findByIdAndUpdate(
        id,
        {
            status: "Inactive",
        },
        {
            new: true,
            runValidators: true,
        }
    );

    return vendor;
};

module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
};