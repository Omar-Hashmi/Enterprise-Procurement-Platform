// File: rfq.routes.js

const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/restrictTo.middleware");
const {
  createRFQ,
  getRFQs,
  getRFQById,
  updateRFQ,
  deleteRFQ,
  inviteVendors,
  publishRFQ,
  submitQuotation,
  evaluateQuotation,
  selectVendor,
  closeRFQ,
  cancelRFQ,
  compareQuotations,
  getRFQStatusSummary,
} = require("../controllers/rfq.controller");
const {
  validateCreateRFQ,
  validateUpdateRFQ,
  validateRFQIdParam,
  validateListRFQsQuery,
  validateInviteVendors,
  validateSubmitQuotation,
  validateEvaluateQuotation,
  validateQuotationIdParam,
  validateSelectVendor,
} = require("../validations/rfq.validation");

const router = Router();

// All RFQ routes require an authenticated session
router.use(protect);

router.get("/status-summary", restrictTo("procurement_officer", "admin"), getRFQStatusSummary);

router
  .route("/")
  .get(validateListRFQsQuery, getRFQs)
  .post(restrictTo("procurement_officer", "admin"), validateCreateRFQ, createRFQ);

router
  .route("/:id")
  .get(validateRFQIdParam, getRFQById)
  .patch(restrictTo("procurement_officer", "admin"), validateRFQIdParam, validateUpdateRFQ, updateRFQ)
  .delete(restrictTo("procurement_officer", "admin"), validateRFQIdParam, deleteRFQ);

router.post(
  "/:id/invite-vendors",
  restrictTo("procurement_officer", "admin"),
  validateRFQIdParam,
  validateInviteVendors,
  inviteVendors
);

router.patch(
  "/:id/publish",
  restrictTo("procurement_officer", "admin"),
  validateRFQIdParam,
  publishRFQ
);

// Vendors submit their own quotations — open to the vendor role, not just procurement staff
router.post(
  "/:id/quotations",
  restrictTo("vendor", "procurement_officer", "admin"),
  validateRFQIdParam,
  validateSubmitQuotation,
  submitQuotation
);

router.get(
  "/:id/quotations/compare",
  restrictTo("procurement_officer", "admin"),
  validateRFQIdParam,
  compareQuotations
);

router.patch(
  "/:id/quotations/:quotationId/evaluate",
  restrictTo("procurement_officer", "admin"),
  validateQuotationIdParam,
  validateEvaluateQuotation,
  evaluateQuotation
);

router.patch(
  "/:id/quotations/:quotationId/select",
  restrictTo("procurement_officer", "admin"),
  validateQuotationIdParam,
  validateSelectVendor,
  selectVendor
);

router.patch(
  "/:id/close",
  restrictTo("procurement_officer", "admin"),
  validateRFQIdParam,
  closeRFQ
);

router.patch(
  "/:id/cancel",
  restrictTo("procurement_officer", "admin"),
  validateRFQIdParam,
  cancelRFQ
);

module.exports = router;