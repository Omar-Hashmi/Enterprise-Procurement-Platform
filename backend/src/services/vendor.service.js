const { vendorRepository } = require("../repositories/Vendor.repository");
const { AppError } = require("../utils/AppError");

const VALID_STATUS_TRANSITIONS = {
  pending: ["active", "blacklisted"],
  active: ["suspended", "blacklisted"],
  suspended: ["active", "blacklisted"],
  blacklisted: [], // terminal state
};

/**
 * Service Layer — encapsulates Vendor Management business rules.
 * Controllers should never talk to the repository directly.
 */
class VendorService {
  async createVendor(input) {
    try {
      const existing = await vendorRepository.findByRegistrationNumber(
        input.companyInfo?.registrationNumber
      );
      if (existing) {
        throw new AppError(
          "A vendor with this company registration number already exists.",
          409
        );
      }

      const vendorCode = await this.generateVendorCode();

      return await vendorRepository.create({
        vendorCode,
        companyName: input.companyName,
        companyInfo: input.companyInfo,
        taxInfo: input.taxInfo,
        categories: input.categories ?? [],
        createdBy: input.createdBy,
        status: "pending",
      });
    } catch (error) {
      this.handleGlobalError(error, "Failed to create vendor.");
    }
  }

  async getVendors(filter, pagination) {
    try {
      return await vendorRepository.findAll(filter, pagination);
    } catch (error) {
      this.handleGlobalError(error, "Failed to retrieve vendors list.");
    }
  }

  async getVendorById(id) {
    try {
      const vendor = await vendorRepository.findById(id);
      if (!vendor) throw new AppError("Vendor not found.", 404);
      return vendor;
    } catch (error) {
      this.handleGlobalError(error, `Failed to retrieve vendor with ID: ${id}`);
    }
  }

  async updateVendor(id, payload) {
    try {
      // Guard rails: these fields have dedicated, validated flows and
      // should never be mutated through a generic PATCH.
      const { status, ratings, vendorCode, isBlacklisted, ...safePayload } = payload;

      const vendor = await vendorRepository.update(id, safePayload);
      if (!vendor) throw new AppError("Vendor not found.", 404);
      return vendor;
    } catch (error) {
      this.handleGlobalError(error, `Failed to update vendor with ID: ${id}`);
    }
  }

  async updateVendorStatus(id, nextStatus, reason) {
    try {
      const vendor = await vendorRepository.findById(id);
      if (!vendor) throw new AppError("Vendor not found.", 404);

      const allowedNextStates = VALID_STATUS_TRANSITIONS[vendor.status] || [];
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
    } catch (error) {
      this.handleGlobalError(error, `Failed to update status for vendor ID: ${id}`);
    }
  }

  async deleteVendor(id) {
    try {
      const vendor = await vendorRepository.findById(id);
      if (!vendor) throw new AppError("Vendor not found.", 404);

      if (vendor.status === "active") {
        throw new AppError(
          "Active vendors cannot be deleted. Suspend or blacklist instead.",
          400
        );
      }

      await vendorRepository.delete(id);
    } catch (error) {
      this.handleGlobalError(error, `Failed to delete vendor ID: ${id}`);
    }
  }

  async rateVendor(id, input) {
    try {
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
    } catch (error) {
      this.handleGlobalError(error, `Failed to submit rating for vendor ID: ${id}`);
    }
  }

  async addCertification(id, certification) {
    try {
      if (
        certification.expiryDate &&
        certification.issueDate &&
        new Date(certification.expiryDate) < new Date(certification.issueDate)
      ) {
        throw new AppError("Certification expiry date cannot be before its issue date.", 400);
      }

      const vendor = await vendorRepository.addCertification(id, {
        ...certification,
        verified: false,
      });
      if (!vendor) throw new AppError("Vendor not found.", 404);
      return vendor;
    } catch (error) {
      this.handleGlobalError(error, `Failed to add certification for vendor ID: ${id}`);
    }
  }

  async addBankAccount(id, bankAccount) {
    try {
      const vendor = await vendorRepository.addBankAccount(id, bankAccount);
      if (!vendor) throw new AppError("Vendor not found.", 404);
      return vendor;
    } catch (error) {
      this.handleGlobalError(error, `Failed to add bank account for vendor ID: ${id}`);
    }
  }

  async updateBankAccount(id, accountId, bankAccount) {
    try {
      const vendor = await vendorRepository.updateBankAccount(id, accountId, bankAccount);
      if (!vendor) throw new AppError("Vendor or bank account not found.", 404);
      return vendor;
    } catch (error) { this.handleGlobalError(error, `Failed to update bank account for vendor ID: ${id}`); }
  }
  async deleteBankAccount(id, accountId) {
    try {
      const vendor = await vendorRepository.deleteBankAccount(id, accountId);
      if (!vendor) throw new AppError("Vendor or bank account not found.", 404);
      return vendor;
    } catch (error) { this.handleGlobalError(error, `Failed to delete bank account for vendor ID: ${id}`); }
  }
  async setPrimaryBankAccount(id, accountId) {
    try {
      const vendor = await vendorRepository.setPrimaryBankAccount(id, accountId);
      if (!vendor) throw new AppError("Vendor or bank account not found.", 404);
      return vendor;
    } catch (error) { this.handleGlobalError(error, `Failed to set primary bank account for vendor ID: ${id}`); }
  }

  async getVendorCategories() {
    try {
      return await vendorRepository.findAllCategories();
    } catch (error) {
      this.handleGlobalError(error, "Failed to retrieve vendor categories.");
    }
  }

  async createCategory(name, description) {
    try {
      const existing = await vendorRepository.findCategoryByName(name);
      if (existing) throw new AppError("This vendor category already exists.", 409);

      return await vendorRepository.createCategory({ name, description });
    } catch (error) {
      this.handleGlobalError(error, "Failed to create vendor category.");
    }
  }

  async getVendorStatusSummary() {
    try {
      return await vendorRepository.countByStatus();
    } catch (error) {
      this.handleGlobalError(error, "Failed to aggregate vendor status summary.");
    }
  }

  /** Generates a sequential, zero-padded vendor code, e.g. VEN-000123 */
  async generateVendorCode() {
    try {
      const { total } = await vendorRepository.findAll({}, { page: 1, limit: 1 });
      const nextSequence = (total || 0) + 1;
      return `VEN-${String(nextSequence).padStart(6, "0")}`;
    } catch (error) {
      this.handleGlobalError(error, "Failed to generate sequence vendor code.");
    }
  }

  /**
   * Generates CSV/Excel binary blob data for file exports.
   * Return configuration includes file metadata and raw stream buffer.
   */
  async exportVendorsReport(filter = {}, format = "csv") {
    try {
      const { data } = await vendorRepository.findAll(filter, { page: 1, limit: 10000 });
      
      if (!data || data.length === 0) {
        throw new AppError("No vendor records found matching the export filter criteria.", 404);
      }

      let fileBuffer;
      let contentType;
      let fileName = `vendor_export_${Date.now()}.${format}`;

      if (format.toLowerCase() === "csv") {
        const headers = ["Vendor Code", "Company Name", "Status", "Categories", "Created At"];
        const rows = data.map((v) => [
          v.vendorCode,
          `"${v.companyName || ''}"`,
          v.status,
          `"${(v.categories || []).join(", ")}"`,
          v.createdAt ? new Date(v.createdAt).toISOString() : '',
        ]);

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        fileBuffer = Buffer.from(csvContent, "utf-8");
        contentType = "text/csv";
      } else {
        throw new AppError(`Unsupported export format requested: '${format}'.`, 400);
      }

      return {
        filename: fileName,
        contentType,
        contentLength: fileBuffer.length,
        buffer: fileBuffer,
      };
    } catch (error) {
      this.handleGlobalError(error, "Failed to process vendor analytics blob export.");
    }
  }

  /**
   * Centralized operational and unhandled exception error dispatcher.
   */
  handleGlobalError(error, fallbackMessage) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error(`[VendorService Error]: ${error.message}`, error);
    throw new AppError(fallbackMessage || "An unexpected internal server error occurred.", 500);
  }
}

const vendorService = new VendorService();

module.exports = {
  vendorService,
};
