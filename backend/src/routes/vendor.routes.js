// File: vendor.routes.js

const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/restrictTo.middleware");
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  rateVendor,
  addCertification,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  getVendorCategories,
  createVendorCategory,
  getVendorStatusSummary,
} = require("../controllers/vendor.controller");
const {
  validateCreateVendor,
  validateUpdateVendor,
  validateUpdateVendorStatus,
  validateVendorIdParam,
  validateListVendorsQuery,
  validateRateVendor,
  validateAddCertification,
  validateAddBankAccount,
  validateUpdateBankAccount,
  validateBankAccountIdParam,
  validateCreateVendorCategory,
} = require("../validations/vendor.validation");

const router = Router();

// All vendor routes require an authenticated session
router.use(protect);

// Categories (kept above /:id routes so "categories" isn't parsed as an id)
router
  .route("/categories")
  .get(getVendorCategories)
  .post(
    restrictTo("procurement_manager", "procurement_officer", "admin"),
    validateCreateVendorCategory,
    createVendorCategory
  );

router.get(
  "/status-summary",
  restrictTo("procurement_manager", "procurement_officer", "finance_manager", "department", "department_manager", "ceo", "admin"),
  getVendorStatusSummary
);

router
  .route("/")
  .get(validateListVendorsQuery, getVendors)
  .post(
    restrictTo("procurement_manager", "procurement_officer", "admin"),
    validateCreateVendor,
    createVendor
  );

router
  .route("/:id")
  .get(validateVendorIdParam, getVendorById)
  .patch(
    restrictTo("procurement_manager", "procurement_officer", "admin"),
    validateVendorIdParam,
    validateUpdateVendor,
    updateVendor
  )
  .delete(restrictTo("admin"), validateVendorIdParam, deleteVendor);

router.patch(
  "/:id/status",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateVendorIdParam,
  validateUpdateVendorStatus,
  updateVendorStatus
);

router.post(
  "/:id/ratings",
  restrictTo("procurement_manager", "procurement_officer", "department", "department_manager", "admin"),
  validateVendorIdParam,
  validateRateVendor,
  rateVendor
);
router.patch(
  "/:id/bank-accounts/:accountId",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateBankAccountIdParam,
  validateUpdateBankAccount,
  updateBankAccount
);
router.delete(
  "/:id/bank-accounts/:accountId",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateBankAccountIdParam,
  deleteBankAccount
);
router.patch(
  "/:id/bank-accounts/:accountId/primary",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateBankAccountIdParam,
  setPrimaryBankAccount
);

router.post(
  "/:id/certifications",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateVendorIdParam,
  validateAddCertification,
  addCertification
);

router.post(
  "/:id/bank-accounts",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateVendorIdParam,
  validateAddBankAccount,
  addBankAccount
);

module.exports = router;
