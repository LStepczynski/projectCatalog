// __tests__/asyncHandler.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@utils/asyncHandler';

describe('asyncHandler', () => {
  it('should execute the wrapped function successfully', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    const mockHandler = vi.fn(
      async (req: Request, res: Response, next: NextFunction) => {
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn();
        res.status(200).json({ success: true });
      }
    );

    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(req, res, next);

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass errors to the next function when an error is thrown', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    const mockError = new Error('Test error');
    const mockHandler = vi.fn(async () => {
      throw mockError;
    });

    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(req, res, next);

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should handle synchronous errors correctly', async () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    const mockError = new Error('Sync error');
    const mockHandler = vi.fn(() => {
      throw mockError;
    });

    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(req, res, next);

    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(mockError);
  });
});
