const { analyticsService } = require("../services/analytics.service");
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/AppError");

const getIdParam = (req, name = "id") => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return value;
};

const getDashboardSummary = catchAsync(async (req, res) => {
  const fiscalYear = req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined;
  const summary = await analyticsService.getDashboardSummary(fiscalYear);
  res.status(200).json({ success: true, data: summary });
});

const getVendorRankings = catchAsync(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const rankings = await analyticsService.getVendorRankings(limit);
  res.status(200).json({ success: true, data: rankings });
});

const getVendorPerformance = catchAsync(async (req, res) => {
  const performance = await analyticsService.getVendorPerformance(getIdParam(req, "vendorId"));
  res.status(200).json({ success: true, data: performance });
});

const getBudgetUtilization = catchAsync(async (req, res) => {
  const fiscalYear = Number(req.query.fiscalYear) || new Date().getFullYear();
  const utilization = await analyticsService.getBudgetUtilization(fiscalYear);
  res.status(200).json({ success: true, data: utilization });
});

const getDepartmentSpending = catchAsync(async (req, res) => {
  const fiscalYear = req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined;
  const spending = await analyticsService.getDepartmentSpending(fiscalYear);
  res.status(200).json({ success: true, data: spending });
});

const getProcurementSpendTrend = catchAsync(async (req, res) => {
  const fiscalYear = Number(req.query.fiscalYear) || new Date().getFullYear();
  const range = ["1M", "6M", "1Y"].includes(req.query.range) ? req.query.range : undefined;
  const trend = await analyticsService.getProcurementSpendTrend(fiscalYear, range);
  res.status(200).json({ success: true, data: trend });
});

const getContractComplianceRate = catchAsync(async (_req, res) => {
  const compliance = await analyticsService.getContractComplianceRate();
  res.status(200).json({ success: true, data: compliance });
});
 
module.exports = {
  getDashboardSummary,
  getVendorRankings,
  getVendorPerformance,
  getBudgetUtilization,
  getDepartmentSpending,
  getProcurementSpendTrend,
  getContractComplianceRate,
};