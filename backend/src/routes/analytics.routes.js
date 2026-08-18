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

// In production require authenticated session with proper roles.
// In development we allow unauthenticated access to ease local development and HMR.
if (process.env.NODE_ENV === 'production') {
  // All analytics routes require an authenticated session in production
  router.use(protect);
  router.use(restrictTo("procurement_officer", "finance_officer", "department_manager", "admin"));
} else {
  // Development: no auth required for analytics endpoints to avoid 403 during local dev.
}

router.get("/dashboard", getDashboardSummary);
router.get("/vendors/rankings", getVendorRankings);
router.get("/vendors/:vendorId/performance", getVendorPerformance);
router.get("/budgets/utilization", getBudgetUtilization);
router.get("/budgets/department-spending", getDepartmentSpending);
router.get("/budgets/spend-trend", getProcurementSpendTrend);
router.get("/contracts/compliance-rate", getContractComplianceRate);

module.exports = router;