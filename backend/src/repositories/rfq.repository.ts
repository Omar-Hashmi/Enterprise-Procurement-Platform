import { QueryFilter, Types } from "mongoose";
import { RFQ, IRFQ, IQuotation, RFQStatus, QuotationStatus } from "../models/RFQ";
import { Pagination, PaginatedResult } from "./Vendor.repository";

export interface RFQListFilter {
  status?: RFQStatus;
  department?: string;
  search?: string;
}

export interface RFQCreatePayload extends Omit<Partial<IRFQ>, "quotations"> {
  quotations?: IQuotation[];
}

/**
 * Repository Pattern — isolates all Mongoose/DB access for RFQ so the
 * service layer stays persistence-agnostic and easy to unit test.
 */
class RFQRepository {
  async create(payload: RFQCreatePayload): Promise<IRFQ> {
    return RFQ.create(payload);
  }

  async findById(id: string): Promise<IRFQ | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return RFQ.findById(id)
      .populate("invitedVendors")
      .populate("quotations.vendor")
      .populate("department")
      .exec();
  }

  async findByRfqNumber(rfqNumber: string): Promise<IRFQ | null> {
    return RFQ.findOne({ rfqNumber }).exec();
  }

  async findAll(
    filter: RFQListFilter,
    { page, limit }: Pagination
  ): Promise<PaginatedResult<IRFQ>> {
    const query: QueryFilter<IRFQ> = {};

    if (filter.status) query.status = filter.status;
    if (filter.department) query.department = filter.department as unknown as Types.ObjectId;
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

  async update(id: string, payload: Partial<IRFQ>): Promise<IRFQ | null> {
    return RFQ.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).exec();
  }

  async updateStatus(id: string, status: RFQStatus): Promise<IRFQ | null> {
    return RFQ.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<IRFQ | null> {
    return RFQ.findByIdAndDelete(id).exec();
  }

  /** Adds vendors to invitedVendors and seeds a matching quotation stub for each. */
  async addInvitedVendors(id: string, vendorIds: string[]): Promise<IRFQ | null> {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const existingVendorIds = new Set(rfq.invitedVendors.map((v) => v.toString()));
    const newVendorIds = vendorIds.filter((v) => !existingVendorIds.has(v));

    for (const vendorId of newVendorIds) {
      rfq.invitedVendors.push(vendorId as unknown as Types.ObjectId);
      rfq.quotations.push({
        _id: new Types.ObjectId(),
        vendor: vendorId as unknown as IQuotation["vendor"],
        status: "invited",
        items: [],
        totalQuoteAmount: 0,
        attachments: [],
      });
    }

    await rfq.save();
    return rfq;
  }

  async findQuotationByVendor(id: string, vendorId: string): Promise<IQuotation | null> {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const quotation = rfq.quotations.find((q) => q.vendor.toString() === vendorId);
    return quotation ?? null;
  }

  async submitQuotation(
    id: string,
    vendorId: string,
    data: Partial<IQuotation>
  ): Promise<IRFQ | null> {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const quotation = rfq.quotations.find((q) => q.vendor.toString() === vendorId);
    if (!quotation) return null;

    Object.assign(quotation, data, { status: "submitted" as QuotationStatus, submittedAt: new Date() });
    await rfq.save();
    return rfq;
  }

  async updateQuotationStatus(
    id: string,
    quotationId: string,
    status: QuotationStatus,
    evaluation?: { technicalScore?: number; evaluationNotes?: string }
  ): Promise<IRFQ | null> {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const quotation = rfq.quotations.find((q) => q._id?.toString() === quotationId);
    if (!quotation) return null;

    quotation.status = status;
    if (evaluation?.technicalScore !== undefined) quotation.technicalScore = evaluation.technicalScore;
    if (evaluation?.evaluationNotes !== undefined) quotation.evaluationNotes = evaluation.evaluationNotes;

    await rfq.save();
    return rfq;
  }

  async selectVendor(
    id: string,
    quotationId: string,
    justification?: string
  ): Promise<IRFQ | null> {
    const rfq = await RFQ.findById(id).exec();
    if (!rfq) return null;

    const winningQuotation = rfq.quotations.find((q) => q._id?.toString() === quotationId);
    if (!winningQuotation) return null;

    rfq.quotations.forEach((q) => {
      q.status = q._id?.toString() === quotationId ? "selected" : "rejected";
    });

    rfq.selectedVendor = winningQuotation.vendor as unknown as Types.ObjectId;
    rfq.selectedQuotationId = winningQuotation._id as unknown as Types.ObjectId;
    rfq.selectionJustification = justification;
    rfq.status = "vendor_selected";

    await rfq.save();
    return rfq;
  }

  async countByStatus(): Promise<Record<string, number>> {
    const results = await RFQ.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).exec();

    return results.reduce((acc: Record<string, number>, cur: { _id: string; count: number }) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});
  }
}

export const rfqRepository = new RFQRepository();