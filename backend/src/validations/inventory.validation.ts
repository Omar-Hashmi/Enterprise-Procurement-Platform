import Joi from "joi";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../utils/AppError";

/**
 * Validation Layer — request-shape validation for the Inventory module
 * (delivery records, goods receipt, stock movements, warehouses).
 * Mirrors validations/vendor.validation.ts and its siblings.
 */

type ValidationTarget = "body" | "query" | "params";

const validate = (schema: Joi.ObjectSchema, target: ValidationTarget = "body"): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return next(new AppError(`Validation failed: ${message}`, 400));
    }

    req[target] = value;
    next();
  };
};

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('"{{#label}}" must be a valid id');

// ---- Delivery Records ----

export const createDeliverySchema = Joi.object({
  purchaseOrder: objectId.required(),
  warehouse: objectId.required(),
  expectedDeliveryDate: Joi.date().iso().required(),
  notes: Joi.string().max(1000).optional(),
});

export const updateDeliverySchema = Joi.object({
  expectedDeliveryDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional(),
}).min(1);

export const inventoryIdParamSchema = Joi.object({
  id: objectId.required(),
});

export const purchaseOrderIdParamSchema = Joi.object({
  purchaseOrderId: objectId.required(),
});

export const listDeliveriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  warehouse: objectId.optional(),
  deliveryStatus: Joi.string().valid("pending", "partially_received", "received", "cancelled").optional(),
  purchaseOrder: objectId.optional(),
});

export const pendingDeliveriesQuerySchema = Joi.object({
  warehouse: objectId.optional(),
});

// ---- Goods Receipt ----

const receivedItemSchema = Joi.object({
  purchaseOrderItemId: objectId.required(),
  itemName: Joi.string().required(),
  quantityOrdered: Joi.number().integer().min(0).required(),
  quantityReceived: Joi.number().integer().min(0).required(),
  quantityRejected: Joi.number().integer().min(0).optional(),
  rejectionReason: Joi.string().max(500).optional(),
});

export const receiveGoodsSchema = Joi.object({
  warehouse: objectId.required(),
  items: Joi.array().items(receivedItemSchema).min(1).required(),
});

// ---- Stock Movements ----

export const stockMovementSchema = Joi.object({
  type: Joi.string().valid("outbound", "adjustment", "transfer").required(),
  itemName: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  fromWarehouse: objectId.optional(),
  toWarehouse: objectId.optional(),
  reference: objectId.optional(),
  referenceType: Joi.string().valid("PurchaseOrder", "Manual", "Transfer").optional(),
});

// ---- Warehouses ----

export const createWarehouseSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  code: Joi.string().min(2).max(30).uppercase().required(),
  location: Joi.string().required(),
  capacity: Joi.number().positive().optional(),
});

export const updateWarehouseSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  location: Joi.string().optional(),
  capacity: Joi.number().positive().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const warehouseIdParamSchema = Joi.object({
  warehouseId: objectId.required(),
});

export const listWarehousesQuerySchema = Joi.object({
  includeInactive: Joi.string().valid("true", "false").optional(),
});

// ---- Exported middleware (what routes actually import) ----

export const validateCreateDelivery = validate(createDeliverySchema, "body");
export const validateUpdateDelivery = validate(updateDeliverySchema, "body");
export const validateInventoryIdParam = validate(inventoryIdParamSchema, "params");
export const validatePurchaseOrderIdParam = validate(purchaseOrderIdParamSchema, "params");
export const validateListDeliveriesQuery = validate(listDeliveriesQuerySchema, "query");
export const validatePendingDeliveriesQuery = validate(pendingDeliveriesQuerySchema, "query");
export const validateReceiveGoods = validate(receiveGoodsSchema, "body");
export const validateStockMovement = validate(stockMovementSchema, "body");
export const validateCreateWarehouse = validate(createWarehouseSchema, "body");
export const validateUpdateWarehouse = validate(updateWarehouseSchema, "body");
export const validateWarehouseIdParam = validate(warehouseIdParamSchema, "params");
export const validateListWarehousesQuery = validate(listWarehousesQuerySchema, "query");
