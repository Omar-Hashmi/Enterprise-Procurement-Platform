import { Response } from "express";
import { analyticsService } from "../services/analytics.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";

const getIdParam = (req: AuthRequest, name = "id"): string => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return value;
};

export const getDashboardSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  const summary = await analyticsService.getDashboardSummary();
  res.status(200).json({ success: true, data: summary });
});

export const getVendorRankings = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const rankings = await analyticsService.getVendorRankings(limit);
  res.status(200).json({ success: true, data: rankings });
});

export const getVendorPerformance = catchAsync(async (req: AuthRequest, res: Response) => {
  const performance = await analyticsService.getVendorPerformance(getIdParam(req, "vendorId"));
  res.status(200).json({ success: true, data: performance });
});

export const getBudgetUtilization = catchAsync(async (req: AuthRequest, res: Response) => {
  const fiscalYear = Number(req.query.fiscalYear) || new Date().getFullYear();
  const utilization = await analyticsService.getBudgetUtilization(fiscalYear);
  res.status(200).json({ success: true, data: utilization });
});

export const getDepartmentSpending = catchAsync(async (req: AuthRequest, res: Response) => {
  const fiscalYear = req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined;
  const spending = await analyticsService.getDepartmentSpending(fiscalYear);
  res.status(200).json({ success: true, data: spending });
});

export const getProcurementSpendTrend = catchAsync(async (req: AuthRequest, res: Response) => {
  const fiscalYear = Number(req.query.fiscalYear) || new Date().getFullYear();
  const trend = await analyticsService.getProcurementSpendTrend(fiscalYear);
  res.status(200).json({ success: true, data: trend });
});

export const getContractComplianceRate = catchAsync(async (_req: AuthRequest, res: Response) => {
  const compliance = await analyticsService.getContractComplianceRate();
  res.status(200).json({ success: true, data: compliance });
});
