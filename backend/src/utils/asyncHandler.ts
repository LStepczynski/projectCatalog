import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * A wrapper function that passes the errors from {fn} to the centralized error handling
 *
 * @param {RequestHandler} fn
 * @returns {(req: Request, res: Response, next: NextFunction) => any}
 */
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };
