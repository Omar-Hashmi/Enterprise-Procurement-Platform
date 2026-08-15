// File: analytics.routes.js

const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/restrictTo.middleware");
const {
  getDashboardSummary,
  getVendorRankings,
  getVendorPerformance,
  getBudgetUtilization,
  getDepartmentSpending,
  getProcurementSpendTrend,
  getContractComplianceRate,
} = require("../controllers/analytics.controller");

const router = Router();

// All analytics routes require an authenticated session
router.use(protect);
router.use(restrictTo("procurement_officer", "finance_officer", "department_manager", "admin"));

router.get("/dashboard", getDashboardSummary);
router.get("/vendors/rankings", getVendorRankings);
router.get("/vendors/:vendorId/performance", getVendorPerformance);
router.get("/budgets/utilization", getBudgetUtilization);
router.get("/budgets/department-spending", getDepartmentSpending);
router.get("/budgets/spend-trend", getProcurementSpendTrend);
router.get("/contracts/compliance-rate", getContractComplianceRate);

module.exports = router;