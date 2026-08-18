// File: budget.routes.js

const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/restrictTo.middleware");
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  topUpBudget,
  reserveFunds,
  releaseReservation,
  recordExpense,
  adjustBudget,
  closeBudget,
  checkPurchaseAllowed,
  getBudgetWarnings,
  getBudgetStatusSummary,
} = require("../controllers/budget.controller");
const {
  validateCreateBudget,
  validateUpdateBudget,
  validateBudgetIdParam,
  validateListBudgetsQuery,
  validateTopUpBudget,
  validateReserveFunds,
  validateReleaseReservation,
  validateRecordExpense,
  validateAdjustBudget,
  validateCheckPurchaseQuery,
} = require("../validations/Budget.validation");

const router = Router();

// All budget routes require an authenticated session
router.use(protect);

// Budget Warnings — over-threshold budgets, must come before /:id
router.get(
  "/warnings",
  restrictTo("procurement_officer", "finance_manager", "finance_officer", "admin"),
  getBudgetWarnings
);

router.get(
  "/status-summary",
  restrictTo("procurement_officer", "finance_manager", "finance_officer", "admin"),
  getBudgetStatusSummary
);

router
  .route("/")
  .get(
    restrictTo("procurement_officer", "finance_manager", "finance_officer", "department_manager", "admin"),
    validateListBudgetsQuery,
    getBudgets
  )
  .post(
    restrictTo("finance_manager", "finance_officer", "admin"),
    validateCreateBudget,
    createBudget
  );

router
  .route("/:id")
  .get(
    restrictTo("procurement_officer", "finance_manager", "finance_officer", "department_manager", "admin"),
    validateBudgetIdParam,
    getBudgetById
  )
  .patch(
    restrictTo("finance_manager", "finance_officer", "admin"),
    validateBudgetIdParam,
    validateUpdateBudget,
    updateBudget
  );

router.get(
  "/:id/check-purchase",
  restrictTo("procurement_officer", "admin"),
  validateBudgetIdParam,
  validateCheckPurchaseQuery,
  checkPurchaseAllowed
);

router.post(
  "/:id/top-up",
  restrictTo("finance_manager", "finance_officer", "admin"),
  validateBudgetIdParam,
  validateTopUpBudget,
  topUpBudget
);

router.post(
  "/:id/reserve",
  restrictTo("procurement_officer", "admin"),
  validateBudgetIdParam,
  validateReserveFunds,
  reserveFunds
);

router.post(
  "/:id/release",
  restrictTo("procurement_officer", "admin"),
  validateBudgetIdParam,
  validateReleaseReservation,
  releaseReservation
);

router.post(
  "/:id/expense",
  restrictTo("finance_manager", "finance_officer", "admin"),
  validateBudgetIdParam,
  validateRecordExpense,
  recordExpense
);

router.post(
  "/:id/adjust",
  restrictTo("finance_manager", "finance_officer", "admin"),
  validateBudgetIdParam,
  validateAdjustBudget,
  adjustBudget
);

router.patch(
  "/:id/close",
  restrictTo("finance_manager", "finance_officer", "admin"),
  validateBudgetIdParam,
  closeBudget
);

module.exports = router;
