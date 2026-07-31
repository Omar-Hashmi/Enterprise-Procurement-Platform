import { Response } from "express";
import { vendorService } from "../services/Vendor.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { VendorStatus } from "../models/Vendor";

const parsePagination = (req: AuthRequest) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? "20", 10) || 20));
  return { page, limit };
};

const getIdParam = (req: AuthRequest): string => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return id;
};

export const createVendor = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const vendor = await vendorService.createVendor({
    companyName: req.body.companyName,
    companyInfo: req.body.companyInfo,
    taxInfo: req.body.taxInfo,
    categories: req.body.categories,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: vendor });
});

export const getVendors = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = parsePagination(req);
  const filter = {
    status: req.query.status as VendorStatus | undefined,
    category: req.query.category as string | undefined,
    search: req.query.search as string | undefined,
  };

  const result = await vendorService.getVendors(filter, pagination);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

export const getVendorById = catchAsync(async (req: AuthRequest, res: Response) => {
  const vendor = await vendorService.getVendorById(getIdParam(req));
  res.status(200).json({ success: true, data: vendor });
});

export const updateVendor = catchAsync(async (req: AuthRequest, res: Response) => {
  const vendor = await vendorService.updateVendor(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: vendor });
});

export const updateVendorStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const { status, reason } = req.body as { status: VendorStatus; reason?: string };
  const vendor = await vendorService.updateVendorStatus(getIdParam(req), status, reason);
  res.status(200).json({ success: true, data: vendor });
});

export const deleteVendor = catchAsync(async (req: AuthRequest, res: Response) => {
  await vendorService.deleteVendor(getIdParam(req));
  res.status(204).send();
});

export const rateVendor = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const vendor = await vendorService.rateVendor(getIdParam(req), {
    deliveryScore: req.body.deliveryScore,
    qualityScore: req.body.qualityScore,
    costEfficiencyScore: req.body.costEfficiencyScore,
    complianceScore: req.body.complianceScore,
    comments: req.body.comments,
    ratedBy: req.user.id,
  });

  res.status(201).json({ success: true, data: vendor });
});

export const addCertification = catchAsync(async (req: AuthRequest, res: Response) => {
  const vendor = await vendorService.addCertification(getIdParam(req), {
    name: req.body.name,
    issuingAuthority: req.body.issuingAuthority,
    certificateNumber: req.body.certificateNumber,
    issueDate: new Date(req.body.issueDate),
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
    documentUrl: req.body.documentUrl,
  });

  res.status(201).json({ success: true, data: vendor });
});

export const addBankAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const vendor = await vendorService.addBankAccount(getIdParam(req), {
    bankName: req.body.bankName,
    accountTitle: req.body.accountTitle,
    accountNumber: req.body.accountNumber,
    iban: req.body.iban,
    swiftCode: req.body.swiftCode,
    branchCode: req.body.branchCode,
    isPrimary: Boolean(req.body.isPrimary),
  });

  res.status(201).json({ success: true, data: vendor });
});

export const getVendorCategories = catchAsync(async (_req: AuthRequest, res: Response) => {
  const categories = await vendorService.getVendorCategories();
  res.status(200).json({ success: true, data: categories });
});

export const createVendorCategory = catchAsync(async (req: AuthRequest, res: Response) => {
  const category = await vendorService.createCategory(req.body.name, req.body.description);
  res.status(201).json({ success: true, data: category });
});

export const getVendorStatusSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  const summary = await vendorService.getVendorStatusSummary();
  res.status(200).json({ success: true, data: summary });
});