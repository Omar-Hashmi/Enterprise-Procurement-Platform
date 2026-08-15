// File: contract.service.js

const { contractRepository } = require("../repositories/contract.repository");
const { AppError } = require("../utils/AppError");

/**
 * Service Layer — encapsulates Contract Management business rules:
 * lifecycle validation, renewal reminders, and compliance document
 * verification. Status itself is largely date-derived by the model's
 * pre-save hook; this layer guards the actions that change those dates
 * or short-circuit the derivation (termination).
 */
class ContractService {
  async createContract(input) {
    if (input.startDate >= input.endDate) {
      throw new AppError("Contract start date must be before the end date.", 400);
    }
    if (input.value <= 0) {
      throw new AppError("Contract value must be greater than zero.", 400);
    }

    const contractNumber = await this.generateContractNumber();
    const renewalNoticeDays = input.renewalNoticeDays ?? 30;

    const reminderDate = new Date(input.endDate);
    reminderDate.setDate(reminderDate.getDate() - renewalNoticeDays);

    return contractRepository.create({
      contractNumber,
      title: input.title,
      vendor: input.vendor,
      department: input.department,
      startDate: input.startDate,
      endDate: input.endDate,
      autoRenew: input.autoRenew ?? false,
      renewalNoticeDays,
      renewalReminders: [{ reminderDate, sent: false }],
      value: input.value,
      currency: input.currency ?? "USD",
      paymentTerms: input.paymentTerms,
      status: "draft",
      attachments: [],
      complianceDocuments: [],
      createdBy: input.createdBy,
    });
  }

  async getContracts(filter, pagination) {
    return contractRepository.findAll(filter, pagination);
  }

  async getContractById(id) {
    const contract = await contractRepository.findById(id);
    if (!contract) throw new AppError("Contract not found.", 404);
    return contract;
  }

  async updateContract(id, payload) {
    const contract = await contractRepository.findById(id);
    if (!contract) throw new AppError("Contract not found.", 404);

    if (contract.status === "terminated") {
      throw new AppError("Terminated contracts cannot be edited.", 400);
    }

    const {
      status,
      contractNumber,
      renewalReminders,
      attachments,
      complianceDocuments,
      terminationReason,
      ...safePayload
    } = payload;

    if (
      safePayload.startDate &&
      safePayload.endDate &&
      new Date(safePayload.startDate) >= new Date(safePayload.endDate)
    ) {
      throw new AppError("Contract start date must be before the end date.", 400);
    }

    const updated = await contractRepository.update(id, safePayload);
    if (!updated) throw new AppError("Contract not found.", 404);
    return updated;
  }

  async terminateContract(id, reason) {
    if (!reason || reason.trim().length < 5) {
      throw new AppError("A termination reason of at least 5 characters is required.", 400);
    }

    const contract = await contractRepository.findById(id);
    if (!contract) throw new AppError("Contract not found.", 404);
    if (contract.status === "terminated") {
      throw new AppError("This contract is already terminated.", 400);
    }

    const updated = await contractRepository.terminate(id, reason);
    if (!updated) throw new AppError("Contract not found.", 404);
    return updated;
  }

  async renewContract(id, newEndDate) {
    const contract = await contractRepository.findById(id);
    if (!contract) throw new AppError("Contract not found.", 404);

    if (contract.status === "terminated") {
      throw new AppError("A terminated contract cannot be renewed. Create a new one instead.", 400);
    }
    if (newEndDate <= contract.endDate) {
      throw new AppError("The renewed end date must be after the current end date.", 400);
    }

    const updated = await contractRepository.renew(id, newEndDate);
    if (!updated) throw new AppError("Contract not found.", 404);
    return updated;
  }

  async addAttachment(id, attachment) {
    const contract = await contractRepository.addAttachment(id, {
      ...attachment,
      uploadedAt: new Date(),
    });
    if (!contract) throw new AppError("Contract not found.", 404);
    return contract;
  }

  async addComplianceDocument(id, document) {
    const contract = await contractRepository.addComplianceDocument(id, {
      ...document,
      uploadedAt: new Date(),
      verified: false,
    });
    if (!contract) throw new AppError("Contract not found.", 404);
    return contract;
  }

  async verifyComplianceDocument(id, documentId) {
    const contract = await contractRepository.verifyComplianceDocument(id, documentId);
    if (!contract) throw new AppError("Contract or compliance document not found.", 404);
    return contract;
  }

  async markReminderSent(id, reminderId) {
    const contract = await contractRepository.markReminderSent(id, reminderId);
    if (!contract) throw new AppError("Contract or reminder not found.", 404);
    return contract;
  }

  async deleteContract(id) {
    const contract = await contractRepository.findById(id);
    if (!contract) throw new AppError("Contract not found.", 404);
    if (contract.status !== "draft") {
      throw new AppError("Only draft contracts can be deleted. Terminate it instead.", 400);
    }
    await contractRepository.delete(id);
  }

  /** Contract Expiry — contracts ending within the given window. */
  async getExpiringContracts(days = 30) {
    return contractRepository.findExpiringWithin(days);
  }

  /** Used by the renewal-reminder job to find reminders due to fire. */
  async getDueReminders() {
    return contractRepository.findDueReminders();
  }

  async getContractStatusSummary() {
    return contractRepository.countByStatus();
  }

  async generateContractNumber() {
    const { total } = await contractRepository.findAll({}, { page: 1, limit: 1 });
    const nextSequence = total + 1;
    return `CON-${String(nextSequence).padStart(6, "0")}`;
  }
}

const contractService = new ContractService();

module.exports = {
  ContractService,
  contractService,
};