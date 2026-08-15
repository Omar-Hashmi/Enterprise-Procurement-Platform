// File: vendor.repository.js

const { Types } = require("mongoose");
const { Vendor, VendorCategory } = require("../models/vendor.model");

/**
 * Repository Pattern — isolates all Mongoose/DB access for Vendor Management.
 * The service layer stays persistence-agnostic and easy to unit test.
 */
class VendorRepository {
  // ---- Vendor CRUD ----

  async create(payload) {
    return Vendor.create(payload);
  }

  async findById(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Vendor.findById(id)
      .populate("categories")
      .populate("createdBy", "fullName email role")
      .exec();
  }

  async findByRegistrationNumber(registrationNumber) {
    return Vendor.findOne({
      "companyInfo.registrationNumber": registrationNumber,
    }).exec();
  }

  async findAll(filter, { page, limit }) {
    const query = {};

    if (filter.status) query.status = filter.status;
    if (filter.category) query.categories = filter.category;
    if (filter.search) {
      query.$or = [
        { companyName: { $regex: filter.search, $options: "i" } },
        { vendorCode: { $regex: filter.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Vendor.find(query)
        .populate("categories")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Vendor.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id, payload) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Vendor.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate("categories")
      .exec();
  }

  async updateStatus(id, status, reason) {
    if (!Types.ObjectId.isValid(id)) return null;
    const update = { status };
    if (status === "blacklisted") {
      update.isBlacklisted = true;
      update.blacklistReason = reason;
    }
    return Vendor.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("categories")
      .exec();
  }

  async delete(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Vendor.findByIdAndDelete(id).exec();
  }

  // ---- Ratings ----

  async addRating(id, rating) {
    if (!Types.ObjectId.isValid(id)) return null;
    const vendor = await Vendor.findById(id).exec();
    if (!vendor) return null;
    vendor.ratings.push(rating);
    await vendor.save();
    return vendor;
  }

  // ---- Certifications ----

  async addCertification(id, certification) {
    if (!Types.ObjectId.isValid(id)) return null;
    const vendor = await Vendor.findById(id).exec();
    if (!vendor) return null;
    vendor.certifications.push(certification);
    await vendor.save();
    return vendor;
  }

  // ---- Bank Accounts ----

  async addBankAccount(id, bankAccount) {
    if (!Types.ObjectId.isValid(id)) return null;
    const vendor = await Vendor.findById(id).exec();
    if (!vendor) return null;
    vendor.bankAccounts.push(bankAccount);
    await vendor.save();
    return vendor;
  }

  // ---- Categories ----

  async findAllCategories() {
    return VendorCategory.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findCategoryByName(name) {
    return VendorCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    }).exec();
  }

  async createCategory(payload) {
    return VendorCategory.create(payload);
  }

  // ---- Aggregations ----

  async countByStatus() {
    const results = await Vendor.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();

    return results.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

const vendorRepository = new VendorRepository();

module.exports = {
  vendorRepository,
};