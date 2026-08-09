// File: budget.controller.js

const { budgetService } = require("../services/budget.service");
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

const createBudget = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.createBudget({
    department: req.body.department,
    project: req.body.project,
    fiscalYear: req.body.fiscalYear,
    period: req.body.period,
    allocatedAmount: req.body.allocatedAmount,
    purchaseLimit: req.body.purchaseLimit,
    warningThresholdPercent: req.body.warningThresholdPercent,
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: budget });
});

const getBudgets = catchAsync(async (req, res) => {
  const pagination = parsePagination(req);
  const filter = {
    department: req.query.department,
    project: req.query.project,
    fiscalYear: req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined,
    status: req.query.status,
  };

  const result = await budgetService.getBudgets(filter, pagination);

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

const getBudgetById = catchAsync(async (req, res) => {
  const budget = await budgetService.getBudgetById(getIdParam(req));
  res.status(200).json({ success: true, data: budget });
});

const updateBudget = catchAsync(async (req, res) => {
  const budget = await budgetService.updateBudget(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: budget });
});

const topUpBudget = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.topUpBudget(getIdParam(req), {
    amount: req.body.amount,
    note: req.body.note,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: budget });
});

const reserveFunds = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.reserveFunds(getIdParam(req), {
    amount: req.body.amount,
    reference: req.body.reference,
    referenceType: req.body.referenceType,
    note: req.body.note,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: budget });
});

const releaseReservation = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.releaseReservation(getIdParam(req), {
    amount: req.body.amount,
    reference: req.body.reference,
    referenceType: req.body.referenceType,
    note: req.body.note,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: budget });
});

const recordExpense = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.recordExpense(
    getIdParam(req),
    {
      amount: req.body.amount,
      reference: req.body.reference,
      referenceType: req.body.referenceType,
      note: req.body.note,
      performedBy: req.user.id,
    },
    req.body.releaseReservedAmount !== false
  );

  res.status(200).json({ success: true, data: budget });
});

const adjustBudget = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.adjustBudget(getIdParam(req), {
    amount: req.body.amount,
    note: req.body.note,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: budget });
});

const closeBudget = catchAsync(async (req, res) => {
  const budget = await budgetService.closeBudget(getIdParam(req));
  res.status(200).json({ success: true, data: budget });
});

const checkPurchaseAllowed = catchAsync(async (req, res) => {
  const amount = Number(req.query.amount);
  const result = await budgetService.checkPurchaseAllowed(getIdParam(req), amount);
  res.status(200).json({ success: true, data: result });
});

const getBudgetWarnings = catchAsync(async (_req, res) => {
  const budgets = await budgetService.getBudgetsOverThreshold();
  res.status(200).json({ success: true, data: budgets });
});

const getBudgetStatusSummary = catchAsync(async (_req, res) => {
  const summary = await budgetService.getBudgetStatusSummary();
  res.status(200).json({ success: true, data: summary });
});

module.exports = {
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
};