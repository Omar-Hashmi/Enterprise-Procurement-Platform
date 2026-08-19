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

const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string()
    .valid(
      "admin",
      "employee",
      "department",
      "department_manager",
      "finance_manager",
      "finance_officer",
      "procurement_manager",
      "procurement_officer",
      "warehouse_staff",
      "ceo",
      "vendor"
    )
    .optional(),
  department: Joi.string()
    .valid("IT", "HR", "Finance", "Procurement", "Operations", "Executive")
    .required(),
  phone: Joi.string().required(),
});

const validateRegister = validate(registerSchema, "body");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const validateLogin = validate(loginSchema, "body");

module.exports = {
  registerSchema,
  validateRegister,
  loginSchema,
  validateLogin,
};
