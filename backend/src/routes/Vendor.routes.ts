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
} from "../controllers/vendor.controller";

const router = Router();

// All vendor routes require an authenticated session
router.use(protect);

// Categories (kept above /:id routes so "categories" isn't parsed as an id)
router
  .route("/categories")
  .get(getVendorCategories)
  .post(restrictTo("procurement_officer", "admin"), createVendorCategory);

router.get("/status-summary", restrictTo("procurement_officer", "admin"), getVendorStatusSummary);

router
  .route("/")
  .get(getVendors)
  .post(restrictTo("procurement_officer", "admin"), createVendor);

router
  .route("/:id")
  .get(getVendorById)
  .patch(restrictTo("procurement_officer", "admin"), updateVendor)
  .delete(restrictTo("admin"), deleteVendor);

router.patch(
  "/:id/status",
  restrictTo("procurement_officer", "admin"),
  updateVendorStatus
);

router.post(
  "/:id/ratings",
  restrictTo("procurement_officer", "department_manager", "admin"),
  rateVendor
);

router.post(
  "/:id/certifications",
  restrictTo("procurement_officer", "admin"),
  addCertification
);

router.post(
  "/:id/bank-accounts",
  restrictTo("procurement_officer", "admin"),
  addBankAccount
);

export default router;