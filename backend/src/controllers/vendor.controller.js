const { vendorService } = require("../services/vendor.service");
const { catchAsync } = require("../utils/catchAsync");
const { AppError } = require("../utils/AppError");

const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20));
  return { page, limit };
};

const getIdParam = (req) => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return id;
};

const createVendor = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const vendor = await vendorService.createVendor({
    companyName: req.body.companyName,
    companyInfo: req.body.companyInfo,
    taxInfo: req.body.taxInfo,
    categories: req.body.categories,
    createdBy: req.user.userId,
  });

  res.status(201).json({ success: true, data: vendor });
});

const getVendors = catchAsync(async (req, res) => {
  const pagination = parsePagination(req);
  const filter = {
    status: req.query.status,
    category: req.query.category,
    search: req.query.search,
  };

  const result = await vendorService.getVendors(filter, pagination);

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

const getVendorById = catchAsync(async (req, res) => {
  const vendor = await vendorService.getVendorById(getIdParam(req));
  res.status(200).json({ success: true, data: vendor });
});

const updateVendor = catchAsync(async (req, res) => {
  const vendor = await vendorService.updateVendor(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: vendor });
});

const updateVendorStatus = catchAsync(async (req, res) => {
  const { status, reason } = req.body;
  const vendor = await vendorService.updateVendorStatus(getIdParam(req), status, reason);
  res.status(200).json({ success: true, data: vendor });
});

const deleteVendor = catchAsync(async (req, res) => {
  await vendorService.deleteVendor(getIdParam(req));
  res.status(204).send();
});

const rateVendor = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const vendor = await vendorService.rateVendor(getIdParam(req), {
    deliveryScore: req.body.deliveryScore,
    qualityScore: req.body.qualityScore,
    costEfficiencyScore: req.body.costEfficiencyScore,
    complianceScore: req.body.complianceScore,
    comments: req.body.comments,
    ratedBy: req.user.userId,
  });

  res.status(201).json({ success: true, data: vendor });
});

const addCertification = catchAsync(async (req, res) => {
  const vendor = await vendorService.addCertification(getIdParam(req), {
    name: req.body.name,
    issuingAuthority: req.body.issuingAuthority,
    certificateNumber: req.body.certificateNumber,
    issueDate: new Date(req.body.issueDate),
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
    documentUrl: req.body.documentUrl,
  });

  res.status(201).json({ success: true, data: vendor });
});

const addBankAccount = catchAsync(async (req, res) => {
  const vendor = await vendorService.addBankAccount(getIdParam(req), {
    bankName: req.body.bankName,
    accountTitle: req.body.accountTitle,
    accountNumber: req.body.accountNumber,
    iban: req.body.iban,
    swiftCode: req.body.swiftCode,
    branchCode: req.body.branchCode,
    currency: req.body.currency,
    isPrimary: Boolean(req.body.isPrimary),
  });

  res.status(201).json({ success: true, data: vendor });
});
const updateBankAccount = catchAsync(async (req, res) => {
  const vendor = await vendorService.updateBankAccount(getIdParam(req), req.params.accountId, req.body);
  res.status(200).json({ success: true, data: vendor });
});
const deleteBankAccount = catchAsync(async (req, res) => {
  const vendor = await vendorService.deleteBankAccount(getIdParam(req), req.params.accountId);
  res.status(200).json({ success: true, data: vendor });
});
const setPrimaryBankAccount = catchAsync(async (req, res) => {
  const vendor = await vendorService.setPrimaryBankAccount(getIdParam(req), req.params.accountId);
  res.status(200).json({ success: true, data: vendor });
});

const getVendorCategories = catchAsync(async (_req, res) => {
  const categories = await vendorService.getVendorCategories();
  res.status(200).json({ success: true, data: categories });
});

const createVendorCategory = catchAsync(async (req, res) => {
  const category = await vendorService.createCategory(req.body.name, req.body.description);
  res.status(201).json({ success: true, data: category });
});

const getVendorStatusSummary = catchAsync(async (_req, res) => {
  const summary = await vendorService.getVendorStatusSummary();
  res.status(200).json({ success: true, data: summary });
});

module.exports = {
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
};
