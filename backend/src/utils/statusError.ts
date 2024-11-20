export class StatusError extends Error {
  isUserError: boolean;
  status: number;

  constructor(
    message: string,
    status: number = 500,
    isUserError: boolean = false
  ) {
    super(message);
    this.status = status;
    this.isUserError = isUserError;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserError extends StatusError {
  constructor(message: string, status: number = 400) {
    super(message, status, true);
  }
}

export class InternalError extends StatusError {
  details?: string;

  constructor(message: string, status: number = 500, details?: string) {
    super(message, status, false);
    this.details = details;
  }
}

export type AppError = UserError | InternalError;
