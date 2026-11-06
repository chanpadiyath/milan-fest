// Every error response has the same shape:
// { "error": { "code": "EVENT_FULL", "message": "...", "details": [...] } }

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);
export const unauthorized = (message = 'A valid admin API key is required.') =>
  new ApiError(401, 'UNAUTHORIZED', message);
export const notFound = (message = 'Resource not found.') =>
  new ApiError(404, 'NOT_FOUND', message);
export const conflict = (code, message) => new ApiError(409, code, message);
