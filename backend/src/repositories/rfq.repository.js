// File: rfq.repository.js

const { Types } = require("mongoose");
const { RFQ } = require("../models/RFQ");

/**
 * Repository Pattern — isolates all Mongoose/DB access for RFQ so the
 * service layer stays persistence-agnostic and easy to unit test.
 */
class RFQRepository {
  async create(payload) {
    return RFQ.create(payload);
  }

  async findById(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return RFQ.findById(id)
      .populate("invitedVendors")
      .populate("quotations.vendor")
      .populate("department")
      .exec();
  }

  async findByRfqNumber(rfqNumber) {
    return RFQ.findOne({ rfqNumber }).exec();
  }

  async findAll(filter, { page, limit }) {
    const query = {};

    if (filter.status) query.status = filter.status;
    if (filter.department) query.department = filter.department;
    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: "i" } },
        { rfqNumber: { $regex: filter.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      RFQ.find(query)
        .populate("department")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      RFQ.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(id, payload) {
    return RFQ.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
  }

  async updateStatus(id, status) {
    return RFQ.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).exec();
  }

  async delete(id) {
    return RFQ.findByIdAndDelete(id).exec();
  }

  /** Adds vendors to invitedVendors and seeds a matching quotation stub for each. */
  async addInvitedVendors(id, vendorIds) {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const existingVendorIds = new Set(rfq.invitedVendors.map((v) => v.toString()));
    const newVendorIds = vendorIds.filter((v) => !existingVendorIds.has(v));

    for (const vendorId of newVendorIds) {
      rfq.invitedVendors.push(vendorId);
      rfq.quotations.push({
        vendor: vendorId,
        status: "invited",
        items: [],
        totalQuoteAmount: 0,
        attachments: [],
      });
    }

    await rfq.save();
    return rfq;
  }

  async findQuotationByVendor(id, vendorId) {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const quotation = rfq.quotations.find((q) => q.vendor.toString() === vendorId);
    return quotation ?? null;
  }

  async submitQuotation(id, vendorId, data) {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const quotation = rfq.quotations.find((q) => q.vendor.toString() === vendorId);
    if (!quotation) return null;

    Object.assign(quotation, data, { status: "submitted", submittedAt: new Date() });
    await rfq.save();
    return rfq;
  }

  async updateQuotationStatus(id, quotationId, status, evaluation) {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const quotation = rfq.quotations.id(quotationId);
    if (!quotation) return null;

    quotation.status = status;
    if (evaluation?.technicalScore !== undefined) quotation.technicalScore = evaluation.technicalScore;
    if (evaluation?.evaluationNotes !== undefined) quotation.evaluationNotes = evaluation.evaluationNotes;

    await rfq.save();
    return rfq;
  }

  async selectVendor(id, quotationId, justification) {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const winningQuotation = rfq.quotations.id(quotationId);
    if (!winningQuotation) return null;

    rfq.quotations.forEach((q) => {
      q.status = q._id?.toString() === quotationId ? "selected" : "rejected";
    });

    rfq.selectedVendor = winningQuotation.vendor;
    rfq.selectedQuotationId = winningQuotation._id;
    rfq.selectionJustification = justification;
    rfq.status = "vendor_selected";

    await rfq.save();
    return rfq;
  }

  async findQuotationById(quotationId) {
    const rfq = await RFQ.findOne({ "quotations._id": quotationId })
      .populate("quotations.vendor")
      .populate("purchaseRequisition")
      .exec();

    if (!rfq) return null;

    const quotation = rfq.quotations.id(quotationId);
    if (!quotation) return null;

    const obj = quotation.toObject ? quotation.toObject() : { ...quotation };
    obj.purchaseRequest = rfq.purchaseRequisition ?? rfq.purchaseRequisition;
    return obj;
  }

  async countByStatus() {
    const results = await RFQ.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();

    return results.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

const rfqRepository = new RFQRepository();

module.exports = {
  rfqRepository,
};