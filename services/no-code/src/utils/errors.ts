export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends BaseError {
  details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]>) {
    super(message);
    this.details = details;
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message: string) {
    super(message);
  }
} 