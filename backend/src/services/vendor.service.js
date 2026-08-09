const { vendorRepository } = require("../repositories/vendor.repository");
const { AppError } = require("../utils/AppError");

const VALID_STATUS_TRANSITIONS = {
  pending: ["active", "blacklisted"],
  active: ["suspended", "blacklisted"],
  suspended: ["active", "blacklisted"],
  blacklisted: [], // blacklisting is terminal; requires a manual admin override elsewhere
};

/**
 * Service Layer — encapsulates Vendor Management business rules.
 * Controllers should never talk to the repository directly.
 */
class VendorService {
  async createVendor(input) {
    const existing = await vendorRepository.findByRegistrationNumber(
      input.companyInfo.registrationNumber
    );
    if (existing) {
      throw new AppError(
        "A vendor with this company registration number already exists.",
        409
      );
    }

    const vendorCode = await this.generateVendorCode();

    return vendorRepository.create({
      vendorCode,
      companyName: input.companyName,
      companyInfo: input.companyInfo,
      taxInfo: input.taxInfo,
      categories: input.categories ?? [],
      createdBy: input.createdBy,
      status: "pending",
    });
  }

  async getVendors(filter, pagination) {
    return vendorRepository.findAll(filter, pagination);
  }

  async getVendorById(id) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async updateVendor(id, payload) {
    // Guard rails: these fields have dedicated, validated flows and
    // should never be mutated through a generic PATCH.
    const { status, ratings, vendorCode, isBlacklisted, ...safePayload } = payload;

    const vendor = await vendorRepository.update(id, safePayload);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async updateVendorStatus(id, nextStatus, reason) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw new AppError("Vendor not found.", 404);

    const allowedNextStates = VALID_STATUS_TRANSITIONS[vendor.status];
    if (!allowedNextStates.includes(nextStatus)) {
      throw new AppError(
        `Cannot transition vendor from '${vendor.status}' to '${nextStatus}'.`,
        400
      );
    }

    if (nextStatus === "blacklisted" && !reason) {
      throw new AppError("A reason is required when blacklisting a vendor.", 400);
    }

    const updated = await vendorRepository.updateStatus(id, nextStatus, reason);
    if (!updated) throw new AppError("Vendor not found.", 404);
    return updated;
  }

  async deleteVendor(id) {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw new AppError("Vendor not found.", 404);

    if (vendor.status === "active") {
      throw new AppError(
        "Active vendors cannot be deleted. Suspend or blacklist instead.",
        400
      );
    }

    await vendorRepository.delete(id);
  }

  async rateVendor(id, input) {
    for (const [field, value] of Object.entries(input)) {
      if (field === "comments" || field === "ratedBy") continue;
      if (typeof value === "number" && (value < 1 || value > 5)) {
        throw new AppError(`${field} must be between 1 and 5.`, 400);
      }
    }

    const rating = {
      ratedBy: input.ratedBy,
      deliveryScore: input.deliveryScore,
      qualityScore: input.qualityScore,
      costEfficiencyScore: input.costEfficiencyScore,
      complianceScore: input.complianceScore,
      comments: input.comments,
      ratedAt: new Date(),
    };

    const vendor = await vendorRepository.addRating(id, rating);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async addCertification(id, certification) {
    if (certification.expiryDate && certification.expiryDate < certification.issueDate) {
      throw new AppError("Certification expiry date cannot be before its issue date.", 400);
    }

    const vendor = await vendorRepository.addCertification(id, {
      ...certification,
      verified: false,
    });
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async addBankAccount(id, bankAccount) {
    const vendor = await vendorRepository.addBankAccount(id, bankAccount);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async getVendorCategories() {
    return vendorRepository.findAllCategories();
  }

  async createCategory(name, description) {
    const existing = await vendorRepository.findCategoryByName(name);
    if (existing) throw new AppError("This vendor category already exists.", 409);

    return vendorRepository.createCategory({ name, description });
  }

  async getVendorStatusSummary() {
    return vendorRepository.countByStatus();
  }

  /** Generates a sequential, zero-padded vendor code, e.g. VEN-000123 */
  async generateVendorCode() {
    const { total } = await vendorRepository.findAll({}, { page: 1, limit: 1 });
    const nextSequence = total + 1;
    return `VEN-${String(nextSequence).padStart(6, "0")}`;
  }
}

const vendorService = new VendorService();

module.exports = {
  vendorService,
};