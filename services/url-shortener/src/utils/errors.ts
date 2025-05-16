export class BaseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, public details: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message: string) {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
} 