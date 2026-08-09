// File: AppError.js

/**
 * Standard operational error used by services/controllers.
 * The global errorHandler middleware is expected to check `err.isOperational`
 * and use `statusCode` to shape the response.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = {
  AppError,
};