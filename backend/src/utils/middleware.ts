import { Request, Response, NextFunction } from 'express';
import { AppError, StatusError, UserError } from '@utils/statusError';
import { ErrorResponse } from '@type/index';
import { verifyToken } from '@utils/jwt/verifyToken';

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
      statusCode: 400,
    });
  }

  // Determine if the error is an instance of StatusError
  const isAppError = err instanceof StatusError;

  // Default error properties
  const statusCode = isAppError ? err.status : 500;
  const message =
    isAppError && err.isUserError
      ? err.message
      : 'An unexpected error occurred. Please try again later.';

  // Construct error response
  const resp: ErrorResponse = {
    status: 'error',
    data: null,
    message,
    statusCode: statusCode,
  };

  // Include stack trace in development mode
  if (process.env.DEV_STATE === 'development') {
    resp.stack = err.stack;
  }

  // Log error if it is not an App error or if the app is not in production
  if (
    !isAppError ||
    (isAppError && err.status == 500) ||
    process.env.DEV_STATE !== 'production'
  ) {
    console.error(
      'Error:',
      isAppError ? err.message : '',
      `Error Stack: ${err.stack}`,
      (err as AppError)?.details ?? []
    );
  }

  // Send response
  res.status(resp.statusCode).json(resp);
};

/**
 * Middleware to authenticate requests based on a JSON Web Token (JWT) stored in cookies.
 *
 * @param {boolean} [requireAccount=true] - Determines whether authentication is mandatory.
 * If set to `false`, the request proceeds even if no token is provided.
 *
 * @returns {Function} An Express middleware function.
 *
 * @example
 * // Protect a route that requires authentication
 * app.get('/secure', authenticate(), (req, res) => {
 *   res.json({ message: 'Welcome to the secure route!', user: req.user });
 * });
 *
 * @example
 * // Allow optional authentication
 * app.get('/optional', authenticate(false), (req, res) => {
 *   if (req.user) {
 *     res.json({ message: `Hello, ${req.user.username}!` });
 *   } else {
 *     res.json({ message: 'Hello, guest!' });
 *   }
 * });
 */
export const authenticate = (requireAccount: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
      if (!requireAccount) {
        // Allow unauthenticated requests if `requireAccount` is false
        return next();
      }
      // For required authentication, propagate the error
      return next(new UserError('Authentication token not provided.', 401));
    }

    try {
      // Verify token and attach user data to the request
      req.user = verifyToken(token);
      next();
    } catch (err: any) {
      // Pass errors to the next middleware
      next(err);
    }
  };
};

/**
 * Middleware to enforce role-based access control.
 *
 * @param {string[]} allowed - An array of roles allowed to access the route.
 * @returns {Function} An Express middleware function.
 *
 * @throws {UserError} 401 - If the user is not logged in.
 * @throws {UserError} 403 - If the user does not have the required role.
 *
 * @example
 * // Allow access to admins and editors
 * app.get('/admin', authenticate(), role(['admin', 'editor']), (req, res) => {
 *   res.json({ message: 'Welcome, admin/editor!' });
 * });
 *
 * @example
 * // Deny access to unauthorized roles
 * app.get('/user', authenticate(), role(['user']), (req, res) => {
 *   res.json({ message: 'Welcome, user!' });
 * });
 */
export const role = (allowed: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is logged in
    if (!req.user) {
      return next(new UserError('Login required.', 401));
    }

    // Check if user has any of the allowed roles
    const hasRole = allowed.some((allowedRole: string) =>
      req.user?.roles.includes(allowedRole)
    );

    // User has the required role, proceed
    if (hasRole) {
      return next();
    }

    // If no allowed roles match, deny access
    if (allowed.includes('verified')) {
      return next(new UserError('Verify your account to continue', 403));
    }
    return next(new UserError('Permission denied.', 403));
  };
};
