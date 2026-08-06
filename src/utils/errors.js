export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export const badRequest = (message) => new AppError(message, 400);
export const unauthorized = (message) => new AppError(message, 401);
export const forbidden = (message) => new AppError(message, 403);
export const notFound = (message) => new AppError(message, 404);
export const conflict = (message) => new AppError(message, 409);