import { vendorRepository, VendorListFilter, Pagination } from "../repositories/Vendor.repository";
import {
  IVendor,
  IVendorCategory,
  ICertification,
  IBankAccount,
  IVendorRating,
  VendorStatus,
} from "../models/Vendor";
import { AppError } from "../utils/AppError";

interface CreateVendorInput {
  companyName: string;
  companyInfo: IVendor["companyInfo"];
  taxInfo: IVendor["taxInfo"];
  categories?: string[];
  createdBy: string;
}

interface RatingInput {
  deliveryScore: number;
  qualityScore: number;
  costEfficiencyScore: number;
  complianceScore: number;
  comments?: string;
  ratedBy: string;
}

const VALID_STATUS_TRANSITIONS: Record<VendorStatus, VendorStatus[]> = {
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
  async createVendor(input: CreateVendorInput): Promise<IVendor> {
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
      categories: (input.categories ?? []) as unknown as IVendor["categories"],
      createdBy: input.createdBy as unknown as IVendor["createdBy"],
      status: "pending",
    });
  }

  async getVendors(filter: VendorListFilter, pagination: Pagination) {
    return vendorRepository.findAll(filter, pagination);
  }

  async getVendorById(id: string): Promise<IVendor> {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async updateVendor(id: string, payload: Partial<IVendor>): Promise<IVendor> {
    // Guard rails: these fields have dedicated, validated flows and
    // should never be mutated through a generic PATCH.
    const { status, ratings, vendorCode, isBlacklisted, ...safePayload } =
      payload as Record<string, unknown>;

    const vendor = await vendorRepository.update(id, safePayload as Partial<IVendor>);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async updateVendorStatus(
    id: string,
    nextStatus: VendorStatus,
    reason?: string
  ): Promise<IVendor> {
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

  async deleteVendor(id: string): Promise<void> {
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

  async rateVendor(id: string, input: RatingInput): Promise<IVendor> {
    for (const [field, value] of Object.entries(input)) {
      if (field === "comments" || field === "ratedBy") continue;
      if (typeof value === "number" && (value < 1 || value > 5)) {
        throw new AppError(`${field} must be between 1 and 5.`, 400);
      }
    }

    const rating: IVendorRating = {
      ratedBy: input.ratedBy as unknown as IVendorRating["ratedBy"],
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

  async addCertification(
    id: string,
    certification: Omit<ICertification, "verified">
  ): Promise<IVendor> {
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

  async addBankAccount(id: string, bankAccount: IBankAccount): Promise<IVendor> {
    const vendor = await vendorRepository.addBankAccount(id, bankAccount);
    if (!vendor) throw new AppError("Vendor not found.", 404);
    return vendor;
  }

  async getVendorCategories(): Promise<IVendorCategory[]> {
    return vendorRepository.findAllCategories();
  }

  async createCategory(name: string, description?: string): Promise<IVendorCategory> {
    const existing = await vendorRepository.findCategoryByName(name);
    if (existing) throw new AppError("This vendor category already exists.", 409);

    return vendorRepository.createCategory({ name, description });
  }

  async getVendorStatusSummary(): Promise<Record<string, number>> {
    return vendorRepository.countByStatus();
  }

  /** Generates a sequential, zero-padded vendor code, e.g. VEN-000123 */
  private async generateVendorCode(): Promise<string> {
    const { total } = await vendorRepository.findAll({}, { page: 1, limit: 1 });
    const nextSequence = total + 1;
    return `VEN-${String(nextSequence).padStart(6, "0")}`;
  }
}

export const vendorService = new VendorService();