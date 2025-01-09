export class StatusError extends Error {
  isUserError: boolean;
  status: number;
  details?: string[];

  constructor(
    message: string,
    status: number = 500,
    isUserError: boolean = false,
    details?: string[]
  ) {
    super(message);
    this.status = status;
    this.details = details;
    this.isUserError = isUserError;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserError extends StatusError {
  constructor(message: string, status: number = 400, details?: string[]) {
    super(message, status, true, details);
  }
}

export class InternalError extends StatusError {
  constructor(message: string, status: number = 500, details?: string[]) {
    super(message, status, false, details);
  }
}

export type AppError = UserError | InternalError;
