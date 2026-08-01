import { rfqRepository, RFQListFilter } from "../repositories/rfq.repository";
import { vendorRepository } from "../repositories/Vendor.repository";
import { Pagination } from "../repositories/Vendor.repository";
import { IRFQ, IRFQItem, IQuotationItem, IQuotation, RFQStatus, QuotationStatus } from "../models/RFQ";
import { AppError } from "../utils/AppError";

interface CreateRFQInput {
  title: string;
  description?: string;
  purchaseRequisition?: string;
  department: string;
  items: IRFQItem[];
  submissionDeadline: Date;
  createdBy: string;
}

interface SubmitQuotationInput {
  vendorId: string;
  items: IQuotationItem[];
  paymentTerms?: string;
  deliveryTerms?: string;
  validUntil?: Date;
  attachments?: string[];
}

const RFQ_TRANSITIONS: Record<RFQStatus, RFQStatus[]> = {
  draft: ["published", "cancelled"],
  published: ["quotes_received", "cancelled"],
  quotes_received: ["under_evaluation", "cancelled"],
  under_evaluation: ["vendor_selected", "cancelled"],
  vendor_selected: ["closed", "cancelled"],
  closed: [],
  cancelled: [],
};

/**
 * Service Layer — encapsulates RFQ, quotation, and vendor-selection
 * business rules. Controllers only ever talk to this layer.
 */
class RFQService {
  async createRFQ(input: CreateRFQInput): Promise<IRFQ> {
    if (input.submissionDeadline.getTime() <= Date.now()) {
      throw new AppError("Submission deadline must be in the future.", 400);
    }
    if (!input.items || input.items.length === 0) {
      throw new AppError("An RFQ must contain at least one item.", 400);
    }

    const rfqNumber = await this.generateRFQNumber();

    return rfqRepository.create({
      rfqNumber,
      title: input.title,
      description: input.description,
      purchaseRequisition: input.purchaseRequisition as unknown as IRFQ["purchaseRequisition"],
      department: input.department as unknown as IRFQ["department"],
      items: input.items,
      submissionDeadline: input.submissionDeadline,
      invitedVendors: [],
      quotations: [],
      status: "draft",
      createdBy: input.createdBy as unknown as IRFQ["createdBy"],
    });
  }

  async getRFQs(filter: RFQListFilter, pagination: Pagination) {
    return rfqRepository.findAll(filter, pagination);
  }

  async getRFQById(id: string): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);
    return rfq;
  }

  async updateRFQ(id: string, payload: Partial<IRFQ>): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (rfq.status !== "draft") {
      throw new AppError("Only RFQs still in draft can be edited.", 400);
    }

    const { status, quotations, invitedVendors, rfqNumber, ...safePayload } =
      payload as Record<string, unknown>;

    const updated = await rfqRepository.update(id, safePayload as Partial<IRFQ>);
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async deleteRFQ(id: string): Promise<void> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (rfq.status !== "draft") {
      throw new AppError("Only draft RFQs can be deleted. Cancel it instead.", 400);
    }
    await rfqRepository.delete(id);
  }

  async inviteVendors(id: string, vendorIds: string[]): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (!["draft", "published"].includes(rfq.status)) {
      throw new AppError("Vendors can only be invited while the RFQ is draft or published.", 400);
    }

    for (const vendorId of vendorIds) {
      const vendor = await vendorRepository.findById(vendorId);
      if (!vendor) throw new AppError(`Vendor ${vendorId} not found.`, 404);
      if (vendor.status !== "active") {
        throw new AppError(`Vendor ${vendor.companyName} is not active and cannot be invited.`, 400);
      }
    }

    const updated = await rfqRepository.addInvitedVendors(id, vendorIds);
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async publishRFQ(id: string): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "published");

    if (rfq.invitedVendors.length === 0) {
      throw new AppError("Invite at least one vendor before publishing the RFQ.", 400);
    }

    const updated = await rfqRepository.updateStatus(id, "published");
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async submitQuotation(id: string, input: SubmitQuotationInput): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (!["published", "quotes_received"].includes(rfq.status)) {
      throw new AppError("This RFQ is not currently accepting quotations.", 400);
    }
    if (new Date() > rfq.submissionDeadline) {
      throw new AppError("The submission deadline for this RFQ has passed.", 400);
    }

    const quotation = await rfqRepository.findQuotationByVendor(id, input.vendorId);
    if (!quotation) {
      throw new AppError("This vendor was not invited to submit a quotation.", 403);
    }
    if (!input.items || input.items.length === 0) {
      throw new AppError("A quotation must include at least one priced item.", 400);
    }

    const updated = await rfqRepository.submitQuotation(id, input.vendorId, {
      items: input.items,
      paymentTerms: input.paymentTerms,
      deliveryTerms: input.deliveryTerms,
      validUntil: input.validUntil,
      attachments: input.attachments ?? [],
    });
    if (!updated) throw new AppError("RFQ or vendor quotation not found.", 404);

    if (rfq.status === "published") {
      await rfqRepository.updateStatus(id, "quotes_received");
    }

    return this.getRFQById(id);
  }

  async evaluateQuotation(
    id: string,
    quotationId: string,
    input: { status: QuotationStatus; technicalScore?: number; evaluationNotes?: string }
  ): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (!["quotes_received", "under_evaluation"].includes(rfq.status)) {
      throw new AppError("Quotations can only be evaluated once received.", 400);
    }
    if (!["shortlisted", "rejected"].includes(input.status)) {
      throw new AppError("Evaluation status must be 'shortlisted' or 'rejected'.", 400);
    }
    if (input.technicalScore !== undefined && (input.technicalScore < 0 || input.technicalScore > 100)) {
      throw new AppError("Technical score must be between 0 and 100.", 400);
    }

    if (rfq.status === "quotes_received") {
      await rfqRepository.updateStatus(id, "under_evaluation");
    }

    const updated = await rfqRepository.updateQuotationStatus(id, quotationId, input.status, {
      technicalScore: input.technicalScore,
      evaluationNotes: input.evaluationNotes,
    });
    if (!updated) throw new AppError("Quotation not found.", 404);
    return updated;
  }

  async selectVendor(id: string, quotationId: string, justification?: string): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "vendor_selected");

    const quotation = rfq.quotations.find((q) => q._id?.toString() === quotationId);
    if (!quotation) throw new AppError("Quotation not found on this RFQ.", 404);
    if (quotation.status !== "shortlisted") {
      throw new AppError("Only a shortlisted quotation can be selected as the winner.", 400);
    }

    const updated = await rfqRepository.selectVendor(id, quotationId, justification);
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async closeRFQ(id: string): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "closed");

    const updated = await rfqRepository.updateStatus(id, "closed");
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async cancelRFQ(id: string): Promise<IRFQ> {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "cancelled");

    const updated = await rfqRepository.updateStatus(id, "cancelled");
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  /** Returns quotations sorted for side-by-side price comparison. */
  async compareQuotations(id: string): Promise<IQuotation[]> {
    const rfq = await this.getRFQById(id);
    return [...rfq.quotations]
      .filter((q) => q.status !== "invited")
      .sort((a, b) => a.totalQuoteAmount - b.totalQuoteAmount);
  }

  async getRFQStatusSummary(): Promise<Record<string, number>> {
    return rfqRepository.countByStatus();
  }

  private assertTransition(current: RFQStatus, next: RFQStatus): void {
    const allowed = RFQ_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new AppError(`Cannot transition RFQ from '${current}' to '${next}'.`, 400);
    }
  }

  private async generateRFQNumber(): Promise<string> {
    const { total } = await rfqRepository.findAll({}, { page: 1, limit: 1 });
    const nextSequence = total + 1;
    return `RFQ-${String(nextSequence).padStart(6, "0")}`;
  }
}

export const rfqService = new RFQService();