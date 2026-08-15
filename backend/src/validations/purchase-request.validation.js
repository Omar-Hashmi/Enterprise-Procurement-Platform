const Joi = require("joi");

const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return res.status(400).json({ message: `Validation failed: ${message}` });
    }

    req[target] = value;
    next();
  };
};

const createPurchaseRequestSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(2).required(),
  category: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
  estimatedCost: Joi.number().min(0).required(),
  requiredDate: Joi.date().iso().required(),
  remarks: Joi.string().trim().allow("").optional(),
  attachments: Joi.array().items(Joi.string()).optional(),
});

const validateCreatePurchaseRequest = validate(createPurchaseRequestSchema, "body");

module.exports = {
  createPurchaseRequestSchema,
  validateCreatePurchaseRequest,
};
