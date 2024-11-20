import { Request, Response, NextFunction } from 'express';
import { AppError, StatusError } from '@utils/statusError';
import { ErrorResponse } from '@type/index';

import dotenv from 'dotenv';
dotenv.config();

/**
 * Middleware for centralized error handling
 *
 * @param {(AppError | Error)} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle invalid JSON syntax errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      data: null,
      message: 'Invalid JSON format',
    });
  }

  // Determine if the error is an instance of StatusError
  const isAppError = err instanceof StatusError;

  // Default error properties
  const statusCode = isAppError ? err.status : 500;
  const message =
    isAppError && err.isUserError
      ? err.message
      : err.message || 'An unexpected error occurred. Please try again later.';

  // Construct error response
  const resp: ErrorResponse = {
    status: 'error',
    data: null,
    message,
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    resp.stack = err.stack;
  }

  // Log error
  if (!isAppError || process.env.NODE_ENV !== 'production') {
    console.error('Error:', isAppError ? err : JSON.stringify(err, null, 2));
  }

  // Send response
  res.status(statusCode).json(resp);
};
