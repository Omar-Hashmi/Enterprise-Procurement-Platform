import { Response } from "express";
import { budgetService } from "../services/Budget.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { BudgetStatus } from "../models/Budget";

const parsePagination = (req: AuthRequest) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? "20", 10) || 20));
  return { page, limit };
};

const getIdParam = (req: AuthRequest): string => {
  const { id } = req.params;
  if (!id || Array.isArray(id)) {
    throw new AppError("A valid resource id is required.", 400);
  }
  return id;
};

export const createBudget = catchAsync(async (req: AuthRequest, res: Response) => {
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

export const getBudgets = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = parsePagination(req);
  const filter = {
    department: req.query.department as string | undefined,
    project: req.query.project as string | undefined,
    fiscalYear: req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined,
    status: req.query.status as BudgetStatus | undefined,
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

export const getBudgetById = catchAsync(async (req: AuthRequest, res: Response) => {
  const budget = await budgetService.getBudgetById(getIdParam(req));
  res.status(200).json({ success: true, data: budget });
});

export const updateBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  const budget = await budgetService.updateBudget(getIdParam(req), req.body);
  res.status(200).json({ success: true, data: budget });
});

export const topUpBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.topUpBudget(getIdParam(req), {
    amount: req.body.amount,
    note: req.body.note,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: budget });
});

export const reserveFunds = catchAsync(async (req: AuthRequest, res: Response) => {
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

export const releaseReservation = catchAsync(async (req: AuthRequest, res: Response) => {
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

export const recordExpense = catchAsync(async (req: AuthRequest, res: Response) => {
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

export const adjustBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError("Authentication required.", 401);

  const budget = await budgetService.adjustBudget(getIdParam(req), {
    amount: req.body.amount,
    note: req.body.note,
    performedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: budget });
});

export const closeBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  const budget = await budgetService.closeBudget(getIdParam(req));
  res.status(200).json({ success: true, data: budget });
});

export const checkPurchaseAllowed = catchAsync(async (req: AuthRequest, res: Response) => {
  const amount = Number(req.query.amount);
  const result = await budgetService.checkPurchaseAllowed(getIdParam(req), amount);
  res.status(200).json({ success: true, data: result });
});

export const getBudgetWarnings = catchAsync(async (_req: AuthRequest, res: Response) => {
  const budgets = await budgetService.getBudgetsOverThreshold();
  res.status(200).json({ success: true, data: budgets });
});

export const getBudgetStatusSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  const summary = await budgetService.getBudgetStatusSummary();
  res.status(200).json({ success: true, data: summary });
});