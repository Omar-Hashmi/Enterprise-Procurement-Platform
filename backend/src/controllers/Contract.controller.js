// File: contract.controller.js

const { contractService } = require("../services/contract.service");
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/AppError");

const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20));
  return { page, limit };
};

const getIdParam = (req, name = "id") => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return value;
};

const createContract = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const contract = await contractService.createContract({
    title: req.body.title,
    vendor: req.body.vendor,
    department: req.body.department,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    autoRenew: req.body.autoRenew,
    renewalNoticeDays: req.body.renewalNoticeDays,
    value: req.body.value,
    currency: req.body.currency,
    paymentTerms: req.body.paymentTerms,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: contract });
});

const getContracts = catchAsync(async (req, res) => {
  const pagination = parsePagination(req);
  const filter = {
    status: req.query.status,
    vendor: req.query.vendor,
    department: req.query.department,
    search: req.query.search,
  };

  const result = await contractService.getContracts(filter, pagination);

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

const getContractById = catchAsync(async (req, res) => {
  const contract = await contractService.getContractById(getIdParam(req));
  res.status(200).json({ success: true, data: contract });
});

const updateContract = catchAsync(async (req, res) => {
  const contract = await contractService.updateContract(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: contract });
});

const deleteContract = catchAsync(async (req, res) => {
  await contractService.deleteContract(getIdParam(req));
  res.status(204).send();
});

const terminateContract = catchAsync(async (req, res) => {
  const contract = await contractService.terminateContract(getIdParam(req), req.body.reason);
  res.status(200).json({ success: true, data: contract });
});

const renewContract = catchAsync(async (req, res) => {
  const contract = await contractService.renewContract(
    getIdParam(req),
    new Date(req.body.newEndDate)
  );
  res.status(200).json({ success: true, data: contract });
});

const addAttachment = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const contract = await contractService.addAttachment(getIdParam(req), {
    fileName: req.body.fileName,
    fileUrl: req.body.fileUrl,
    uploadedBy: req.user.id,
  });

  res.status(201).json({ success: true, data: contract });
});

const addComplianceDocument = catchAsync(async (req, res) => {
  const contract = await contractService.addComplianceDocument(getIdParam(req), {
    name: req.body.name,
    documentUrl: req.body.documentUrl,
  });

  res.status(201).json({ success: true, data: contract });
});

const verifyComplianceDocument = catchAsync(async (req, res) => {
  const contract = await contractService.verifyComplianceDocument(
    getIdParam(req),
    getIdParam(req, "documentId")
  );
  res.status(200).json({ success: true, data: contract });
});

const markReminderSent = catchAsync(async (req, res) => {
  const contract = await contractService.markReminderSent(
    getIdParam(req),
    getIdParam(req, "reminderId")
  );
  res.status(200).json({ success: true, data: contract });
});

const getExpiringContracts = catchAsync(async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const contracts = await contractService.getExpiringContracts(days);
  res.status(200).json({ success: true, data: contracts });
});

const getContractStatusSummary = catchAsync(async (_req, res) => {
  const summary = await contractService.getContractStatusSummary();
  res.status(200).json({ success: true, data: summary });
});

module.exports = {
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
};