const Joi = require("joi");
const { AppError } = require("../utils/AppError");

/**
 * Validation Layer — request-shape validation for the Inventory module
 * (delivery records, goods receipt, stock movements, warehouses).
 * Mirrors validations/vendor.validation.js and its siblings.
 */

const validate = (schema, target = "body") => {
  return (req, _res, next) => {
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

const createDeliverySchema = Joi.object({
  purchaseOrder: objectId.required(),
  warehouse: objectId.required(),
  expectedDeliveryDate: Joi.date().iso().required(),
  notes: Joi.string().max(1000).optional(),
});

const updateDeliverySchema = Joi.object({
  expectedDeliveryDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional(),
}).min(1);

const inventoryIdParamSchema = Joi.object({
  id: objectId.required(),
});

const purchaseOrderIdParamSchema = Joi.object({
  purchaseOrderId: objectId.required(),
});

const listDeliveriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  warehouse: objectId.optional(),
  deliveryStatus: Joi.string().valid("pending", "partially_received", "received", "cancelled").optional(),
  purchaseOrder: objectId.optional(),
});

const pendingDeliveriesQuerySchema = Joi.object({
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

const receiveGoodsSchema = Joi.object({
  warehouse: objectId.required(),
  items: Joi.array().items(receivedItemSchema).min(1).required(),
});

// ---- Stock Movements ----

const stockMovementSchema = Joi.object({
  type: Joi.string().valid("outbound", "adjustment", "transfer").required(),
  itemName: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  fromWarehouse: objectId.optional(),
  toWarehouse: objectId.optional(),
  reference: objectId.optional(),
  referenceType: Joi.string().valid("PurchaseOrder", "Manual", "Transfer").optional(),
});

// ---- Warehouses ----

const createWarehouseSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  code: Joi.string().min(2).max(30).uppercase().required(),
  location: Joi.string().required(),
  capacity: Joi.number().positive().optional(),
});

const updateWarehouseSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  location: Joi.string().optional(),
  capacity: Joi.number().positive().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const warehouseIdParamSchema = Joi.object({
  warehouseId: objectId.required(),
});

const listWarehousesQuerySchema = Joi.object({
  includeInactive: Joi.string().valid("true", "false").optional(),
});

// ---- Exported middleware (what routes actually import) ----

const validateCreateDelivery = validate(createDeliverySchema, "body");
const validateUpdateDelivery = validate(updateDeliverySchema, "body");
const validateInventoryIdParam = validate(inventoryIdParamSchema, "params");
const validatePurchaseOrderIdParam = validate(purchaseOrderIdParamSchema, "params");
const validateListDeliveriesQuery = validate(listDeliveriesQuerySchema, "query");
const validatePendingDeliveriesQuery = validate(pendingDeliveriesQuerySchema, "query");
const validateReceiveGoods = validate(receiveGoodsSchema, "body");
const validateStockMovement = validate(stockMovementSchema, "body");
const validateCreateWarehouse = validate(createWarehouseSchema, "body");
const validateUpdateWarehouse = validate(updateWarehouseSchema, "body");
const validateWarehouseIdParam = validate(warehouseIdParamSchema, "params");
const validateListWarehousesQuery = validate(listWarehousesQuerySchema, "query");

module.exports = {
  validateCreateDelivery,
  validateUpdateDelivery,
  validateInventoryIdParam,
  validatePurchaseOrderIdParam,
  validateListDeliveriesQuery,
  validatePendingDeliveriesQuery,
  validateReceiveGoods,
  validateStockMovement,
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateWarehouseIdParam,
  validateListWarehousesQuery,
};