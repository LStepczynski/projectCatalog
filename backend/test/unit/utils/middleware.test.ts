import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '@utils/middleware';
import { StatusError } from '@utils/statusError';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Mock routes to test the errorHandler middleware
app.post(
  '/syntax-error',
  express.text(),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      JSON.parse(req.body); // Manually parse JSON to simulate syntax error
    } catch (err) {
      if (err instanceof SyntaxError) {
        next(err);
      } else {
        next(new Error('Unexpected error'));
      }
    }
  }
);

app.get('/status-error', (req: Request, res: Response, next: NextFunction) => {
  next(new StatusError('Custom error message', 400, true));
});

app.get(
  '/unexpected-error',
  (req: Request, res: Response, next: NextFunction) => {
    next(new Error('Unexpected error'));
  }
);

app.get('/no-error', (req: Request, res: Response) => {
  res.json({ message: 'All good!' });
});

// Attach errorHandler middleware
app.use(errorHandler);

describe('ErrorHandler Middleware', () => {
  beforeEach(() => {
    process.env.DEV_STATE = 'production'; // Default to production mode
  });

  it('should return 400 for invalid JSON syntax error', async () => {
    const res = await request(app)
      .post('/syntax-error')
      .set('Content-Type', 'application/json')
      .send('{invalidJson: true}'); // Send malformed JSON

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 'error',
      data: null,
      message: 'Invalid JSON format',
    });
  });

  it('should return 400 and custom message for StatusError', async () => {
    const res = await request(app).get('/status-error');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 'error',
      data: null,
      message: 'Custom error message',
    });
  });

  it('should return 500 for unexpected errors in production mode', async () => {
    const res = await request(app).get('/unexpected-error');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      data: null,
      message: 'An unexpected error occurred. Please try again later.',
    });
    expect(res.body.stack).toBeUndefined(); // No stack trace in production
  });

  it('should include stack trace in development mode', async () => {
    process.env.DEV_STATE = 'development';

    const res = await request(app).get('/unexpected-error');

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe(
      'An unexpected error occurred. Please try again later.'
    );
    expect(res.body.stack).toBeDefined(); // Stack trace should be included
  });

  it('should not interfere with valid routes', async () => {
    const res = await request(app).get('/no-error');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'All good!' });
  });

  it('should log errors in development mode', async () => {
    process.env.DEV_STATE = 'development';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await request(app).get('/unexpected-error');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error:',
      expect.stringContaining('Unexpected error')
    );

    consoleSpy.mockRestore();
  });

  it('should not log errors in production for AppErrors', async () => {
    process.env.DEV_STATE = 'production';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await request(app).get('/status-error');

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
