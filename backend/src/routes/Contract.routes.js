// File: contract.routes.js

const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/restrictTo.middleware");
const {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
  terminateContract,
  renewContract,
  addAttachment,
  addComplianceDocument,
  verifyComplianceDocument,
  markReminderSent,
  getExpiringContracts,
  getContractStatusSummary,
} = require("../controllers/contract.controller");
const {
  validateCreateContract,
  validateUpdateContract,
  validateContractIdParam,
  validateListContractsQuery,
  validateExpiringContractsQuery,
  validateTerminateContract,
  validateRenewContract,
  validateAddAttachment,
  validateAddComplianceDocument,
  validateComplianceDocumentParam,
  validateReminderParam,
} = require("../validations/contract.validation");

const router = express.Router();

// All contract routes require an authenticated session
router.use(protect);

// Contract Expiry — must come before /:id
router.get(
  "/expiring",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateExpiringContractsQuery,
  getExpiringContracts
);

router.get(
  "/status-summary",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  getContractStatusSummary
);

router
  .route("/")
  .get(restrictTo("procurement_manager", "procurement_officer", "admin"), validateListContractsQuery, getContracts)
  .post(restrictTo("procurement_manager", "procurement_officer", "admin"), validateCreateContract, createContract);

router
  .route("/:id")
  .get(restrictTo("procurement_manager", "procurement_officer", "admin"), validateContractIdParam, getContractById)
  .patch(
    restrictTo("procurement_manager", "procurement_officer", "admin"),
    validateContractIdParam,
    validateUpdateContract,
    updateContract
  )
  .delete(restrictTo("admin"), validateContractIdParam, deleteContract);

router.patch(
  "/:id/terminate",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateContractIdParam,
  validateTerminateContract,
  terminateContract
);

router.patch(
  "/:id/renew",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateContractIdParam,
  validateRenewContract,
  renewContract
);

router.post(
  "/:id/attachments",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateContractIdParam,
  validateAddAttachment,
  addAttachment
);

router.post(
  "/:id/compliance-documents",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateContractIdParam,
  validateAddComplianceDocument,
  addComplianceDocument
);

router.patch(
  "/:id/compliance-documents/:documentId/verify",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateComplianceDocumentParam,
  verifyComplianceDocument
);

router.patch(
  "/:id/reminders/:reminderId/mark-sent",
  restrictTo("procurement_manager", "procurement_officer", "admin"),
  validateReminderParam,
  markReminderSent
);

module.exports = router;