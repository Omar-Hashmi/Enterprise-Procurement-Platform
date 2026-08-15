const { rfqRepository } = require("../repositories/rfq.repository");
const { vendorRepository } = require("../repositories/vendor.repository");
const { compareQuotations } = require("../utils/priceComparison");
const { AppError } = require("../utils/AppError");

const RFQ_TRANSITIONS = {
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
  async createRFQ(input) {
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
      purchaseRequisition: input.purchaseRequisition,
      department: input.department,
      items: input.items,
      submissionDeadline: input.submissionDeadline,
      invitedVendors: [],
      quotations: [],
      status: "draft",
      createdBy: input.createdBy,
    });
  }

  async getRFQs(filter, pagination) {
    return rfqRepository.findAll(filter, pagination);
  }

  async getRFQById(id) {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);
    return rfq;
  }

  async updateRFQ(id, payload) {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (rfq.status !== "draft") {
      throw new AppError("Only RFQs still in draft can be edited.", 400);
    }

    const { status, quotations, invitedVendors, rfqNumber, ...safePayload } = payload;

    const updated = await rfqRepository.update(id, safePayload);
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async deleteRFQ(id) {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    if (rfq.status !== "draft") {
      throw new AppError("Only draft RFQs can be deleted. Cancel it instead.", 400);
    }
    await rfqRepository.delete(id);
  }

  async inviteVendors(id, vendorIds) {
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

  async publishRFQ(id) {
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

  async submitQuotation(id, input) {
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

  async evaluateQuotation(id, quotationId, input) {
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

  async selectVendor(id, quotationId, justification) {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "vendor_selected");

    const quotation = rfq.quotations.id(quotationId);
    if (!quotation) throw new AppError("Quotation not found on this RFQ.", 404);
    if (quotation.status !== "shortlisted") {
      throw new AppError("Only a shortlisted quotation can be selected as the winner.", 400);
    }

    const updated = await rfqRepository.selectVendor(id, quotationId, justification);
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async closeRFQ(id) {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "closed");

    const updated = await rfqRepository.updateStatus(id, "closed");
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  async cancelRFQ(id) {
    const rfq = await rfqRepository.findById(id);
    if (!rfq) throw new AppError("RFQ not found.", 404);

    this.assertTransition(rfq.status, "cancelled");

    const updated = await rfqRepository.updateStatus(id, "cancelled");
    if (!updated) throw new AppError("RFQ not found.", 404);
    return updated;
  }

  /** Returns quotations sorted for side-by-side price comparison. */
  async compareQuotations(id) {
    const rfq = await this.getRFQById(id);

    const comparable = rfq.quotations
      .filter((q) => q.status !== "invited")
      .map((q) => ({
        vendorId: q.vendor.toString(),
        totalQuoteAmount: q.totalQuoteAmount,
        deliveryDays: Math.max(...q.items.map((item) => item.deliveryDays), 0),
        technicalScore: q.technicalScore,
      }));

    return compareQuotations(comparable);
  }

  async getRFQStatusSummary() {
    return rfqRepository.countByStatus();
  }

  assertTransition(current, next) {
    const allowed = RFQ_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new AppError(`Cannot transition RFQ from '${current}' to '${next}'.`, 400);
    }
  }

  async generateRFQNumber() {
    const { total } = await rfqRepository.findAll({}, { page: 1, limit: 1 });
    const nextSequence = total + 1;
    return `RFQ-${String(nextSequence).padStart(6, "0")}`;
  }
}

const rfqService = new RFQService();

module.exports = {
  rfqService,
};