import { describe, it, expect, vi } from 'vitest';
import { StatusError, UserError, InternalError } from '@utils/statusError';

describe('StatusError', () => {
  it('should correctly initialize properties', () => {
    const error = new StatusError('Test error', 400, true, [
      'detail1',
      'detail2',
    ]);

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.isUserError).toBe(true);
    expect(error.details).toEqual(['detail1', 'detail2']);
  });

  it('should default to status 500 and isUserError false', () => {
    const error = new StatusError('Default error');

    expect(error.status).toBe(500);
    expect(error.isUserError).toBe(false);
    expect(error.details).toBeUndefined();
  });

  it('should capture stack trace', () => {
    const mockCaptureStackTrace = vi.spyOn(Error, 'captureStackTrace');
    const error = new StatusError('Stack trace test');

    expect(mockCaptureStackTrace).toHaveBeenCalledWith(
      error,
      error.constructor
    );
    mockCaptureStackTrace.mockRestore();
  });
});

describe('UserError', () => {
  it('should set isUserError to true by default', () => {
    const error = new UserError('User error');

    expect(error.message).toBe('User error');
    expect(error.status).toBe(400);
    expect(error.isUserError).toBe(true);
    expect(error.details).toBeUndefined();
  });

  it('should allow overriding status and details', () => {
    const error = new UserError('Custom user error', 422, ['detail1']);

    expect(error.status).toBe(422);
    expect(error.details).toEqual(['detail1']);
  });
});

describe('InternalError', () => {
  it('should set isUserError to false by default', () => {
    const error = new InternalError('Internal error');

    expect(error.message).toBe('Internal error');
    expect(error.status).toBe(500);
    expect(error.isUserError).toBe(false);
    expect(error.details).toBeUndefined();
  });

  it('should allow overriding status and details', () => {
    const error = new InternalError('Custom internal error', 503, [
      'detail1',
      'detail2',
    ]);

    expect(error.status).toBe(503);
    expect(error.details).toEqual(['detail1', 'detail2']);
  });
});
