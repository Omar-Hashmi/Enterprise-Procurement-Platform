import { Router } from "express";
import { protect } from "../middleware/auth";
import { restrictTo } from "../middleware/role";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  rateVendor,
  addCertification,
  addBankAccount,
  getVendorCategories,
  createVendorCategory,
  getVendorStatusSummary,
} from "../controllers/Vendor.controller";
import {
  validateCreateVendor,
  validateUpdateVendor,
  validateUpdateVendorStatus,
  validateVendorIdParam,
  validateListVendorsQuery,
  validateRateVendor,
  validateAddCertification,
  validateAddBankAccount,
  validateCreateVendorCategory,
} from "../validations/Vendor.validation";

const router = Router();

// All vendor routes require an authenticated session
router.use(protect);

// Categories (kept above /:id routes so "categories" isn't parsed as an id)
router
  .route("/categories")
  .get(getVendorCategories)
  .post(
    restrictTo("procurement_officer", "admin"),
    validateCreateVendorCategory,
    createVendorCategory
  );

router.get("/status-summary", restrictTo("procurement_officer", "admin"), getVendorStatusSummary);

router
  .route("/")
  .get(validateListVendorsQuery, getVendors)
  .post(restrictTo("procurement_officer", "admin"), validateCreateVendor, createVendor);

router
  .route("/:id")
  .get(validateVendorIdParam, getVendorById)
  .patch(
    restrictTo("procurement_officer", "admin"),
    validateVendorIdParam,
    validateUpdateVendor,
    updateVendor
  )
  .delete(restrictTo("admin"), validateVendorIdParam, deleteVendor);

router.patch(
  "/:id/status",
  restrictTo("procurement_officer", "admin"),
  validateVendorIdParam,
  validateUpdateVendorStatus,
  updateVendorStatus
);

router.post(
  "/:id/ratings",
  restrictTo("procurement_officer", "department_manager", "admin"),
  validateVendorIdParam,
  validateRateVendor,
  rateVendor
);

router.post(
  "/:id/certifications",
  restrictTo("procurement_officer", "admin"),
  validateVendorIdParam,
  validateAddCertification,
  addCertification
);

router.post(
  "/:id/bank-accounts",
  restrictTo("procurement_officer", "admin"),
  validateVendorIdParam,
  validateAddBankAccount,
  addBankAccount
);

export default router;