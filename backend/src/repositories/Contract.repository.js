// File: contract.repository.js

const { Types } = require("mongoose");
const { Contract } = require("../models/Contract");

/**
 * Repository Pattern — isolates all Mongoose/DB access for Contract so
 * the service layer stays persistence-agnostic and easy to unit test.
 */
class ContractRepository {
  async create(payload) {
    return Contract.create(payload);
  }

  async findById(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Contract.findById(id).populate("vendor").populate("department").exec();
  }

  async findByContractNumber(contractNumber) {
    return Contract.findOne({ contractNumber }).exec();
  }

  async findAll(filter, { page, limit }) {
    const query = {};

    if (filter.status) query.status = filter.status;
    if (filter.vendor) query.vendor = filter.vendor;
    if (filter.department) query.department = filter.department;
    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: "i" } },
        { contractNumber: { $regex: filter.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Contract.find(query)
        .populate("vendor")
        .populate("department")
        .sort({ endDate: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Contract.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findExpiringWithin(days) {
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() + days);

    return Contract.find({
      status: { $in: ["active", "expiring_soon"] },
      endDate: { $lte: windowEnd },
    })
      .populate("vendor")
      .exec();
  }

  async findDueReminders(asOf = new Date()) {
    return Contract.find({
      status: { $ne: "terminated" },
      renewalReminders: {
        $elemMatch: { sent: false, reminderDate: { $lte: asOf } },
      },
    })
      .populate("vendor")
      .exec();
  }

  async update(id, payload) {
    return Contract.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
  }

  async terminate(id, reason) {
    return Contract.findByIdAndUpdate(
      id,
      { status: "terminated", terminationReason: reason },
      { new: true, runValidators: true }
    ).exec();
  }

  async renew(id, newEndDate) {
    const contract = await Contract.findById(id).exec();
    if (!contract) return null;

    contract.endDate = newEndDate;
    contract.status = "active";
    const nextReminderDate = new Date(newEndDate);
    nextReminderDate.setDate(nextReminderDate.getDate() - contract.renewalNoticeDays);
    contract.renewalReminders.push({ reminderDate: nextReminderDate, sent: false });

    await contract.save(); // pre-save hook re-derives status from the new dates
    return contract;
  }

  async addAttachment(id, attachment) {
    return Contract.findByIdAndUpdate(
      id,
      { $push: { attachments: attachment } },
      { new: true, runValidators: true }
    ).exec();
  }

  async addComplianceDocument(id, document) {
    return Contract.findByIdAndUpdate(
      id,
      { $push: { complianceDocuments: document } },
      { new: true, runValidators: true }
    ).exec();
  }

  async verifyComplianceDocument(id, documentId) {
    const contract = await Contract.findById(id).exec();
    if (!contract) return null;

    const document = contract.complianceDocuments.id(documentId);
    if (!document) return null;

    document.verified = true;
    await contract.save();
    return contract;
  }

  async markReminderSent(id, reminderId) {
    const contract = await Contract.findById(id).exec();
    if (!contract) return null;

    const reminder = contract.renewalReminders.id(reminderId);
    if (!reminder) return null;

    reminder.sent = true;
    reminder.sentAt = new Date();
    await contract.save();
    return contract;
  }

  async delete(id) {
    return Contract.findByIdAndDelete(id).exec();
  }

  async countByStatus() {
    const results = await Contract.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();

    return results.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

const contractRepository = new ContractRepository();

module.exports = {
  ContractRepository,
  contractRepository,
};