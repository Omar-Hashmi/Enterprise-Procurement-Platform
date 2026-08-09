const { rfqService } = require("../services/rfq.service");
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

const createRFQ = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const rfq = await rfqService.createRFQ({
    title: req.body.title,
    description: req.body.description,
    purchaseRequisition: req.body.purchaseRequisition,
    department: req.body.department,
    items: req.body.items,
    submissionDeadline: new Date(req.body.submissionDeadline),
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: rfq });
});

const getRFQs = catchAsync(async (req, res) => {
  const pagination = parsePagination(req);
  const filter = {
    status: req.query.status,
    department: req.query.department,
    search: req.query.search,
  };

  const result = await rfqService.getRFQs(filter, pagination);

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

const getRFQById = catchAsync(async (req, res) => {
  const rfq = await rfqService.getRFQById(getIdParam(req));
  res.status(200).json({ success: true, data: rfq });
});

const updateRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.updateRFQ(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: rfq });
});

const deleteRFQ = catchAsync(async (req, res) => {
  await rfqService.deleteRFQ(getIdParam(req));
  res.status(204).send();
});

const inviteVendors = catchAsync(async (req, res) => {
  const rfq = await rfqService.inviteVendors(getIdParam(req), req.body.vendorIds);
  res.status(200).json({ success: true, data: rfq });
});

const publishRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.publishRFQ(getIdParam(req));
  res.status(200).json({ success: true, data: rfq });
});

const submitQuotation = catchAsync(async (req, res) => {
  const rfq = await rfqService.submitQuotation(getIdParam(req), {
    vendorId: req.body.vendorId,
    items: req.body.items,
    paymentTerms: req.body.paymentTerms,
    deliveryTerms: req.body.deliveryTerms,
    validUntil: req.body.validUntil ? new Date(req.body.validUntil) : undefined,
    attachments: req.body.attachments,
  });

  res.status(201).json({ success: true, data: rfq });
});

const evaluateQuotation = catchAsync(async (req, res) => {
  const rfq = await rfqService.evaluateQuotation(getIdParam(req), getIdParam(req, "quotationId"), {
    status: req.body.status,
    technicalScore: req.body.technicalScore,
    evaluationNotes: req.body.evaluationNotes,
  });

  res.status(200).json({ success: true, data: rfq });
});

const selectVendor = catchAsync(async (req, res) => {
  const rfq = await rfqService.selectVendor(
    getIdParam(req),
    getIdParam(req, "quotationId"),
    req.body.justification
  );

  res.status(200).json({ success: true, data: rfq });
});

const closeRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.closeRFQ(getIdParam(req));
  res.status(200).json({ success: true, data: rfq });
});

const cancelRFQ = catchAsync(async (req, res) => {
  const rfq = await rfqService.cancelRFQ(getIdParam(req));
  res.status(200).json({ success: true, data: rfq });
});

const compareQuotations = catchAsync(async (req, res) => {
  const quotations = await rfqService.compareQuotations(getIdParam(req));
  res.status(200).json({ success: true, data: quotations });
});

const getRFQStatusSummary = catchAsync(async (_req, res) => {
  const summary = await rfqService.getRFQStatusSummary();
  res.status(200).json({ success: true, data: summary });
});

module.exports = {
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
};