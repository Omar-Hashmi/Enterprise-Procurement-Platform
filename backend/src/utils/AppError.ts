/**
 * Standard operational error used by services/controllers.
 * The global errorHandler middleware (Developer 1) is expected to
 * check `err.isOperational` and use `statusCode` to shape the response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    const captureStackTrace = (Error as typeof Error & {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    }).captureStackTrace;

    if (captureStackTrace) {
      captureStackTrace(this, this.constructor);
    }
  }
}