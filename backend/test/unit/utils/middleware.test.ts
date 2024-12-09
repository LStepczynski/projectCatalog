import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import { authenticate, errorHandler, role } from '@utils/middleware';
import { StatusError } from '@utils/statusError';

// ----------------   ERROR HANDLER   ----------------

const errorApp = express();

// Middleware to parse JSON
errorApp.use(express.json());

// Mock routes to test the errorHandler middleware
errorApp.post(
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

errorApp.get(
  '/status-error',
  (req: Request, res: Response, next: NextFunction) => {
    next(new StatusError('Custom error message', 400, true));
  }
);

errorApp.get(
  '/unexpected-error',
  (req: Request, res: Response, next: NextFunction) => {
    next(new Error('Unexpected error'));
  }
);

errorApp.get('/no-error', (req: Request, res: Response) => {
  res.json({ message: 'All good!' });
});

// Attach errorHandler middleware
errorApp.use(errorHandler);

describe('ErrorHandler Middleware', () => {
  beforeEach(() => {
    process.env.DEV_STATE = 'production'; // Default to production mode
  });

  it('should return 400 for invalid JSON syntax error', async () => {
    const res = await request(errorApp)
      .post('/syntax-error')
      .set('Content-Type', 'application/json')
      .send('{invalidJson: true}'); // Send malformed JSON

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 'error',
      data: null,
      message: 'Invalid JSON format',
      statusCode: 400,
    });
  });

  it('should return 400 and custom message for StatusError', async () => {
    const res = await request(errorApp).get('/status-error');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 'error',
      data: null,
      message: 'Custom error message',
      statusCode: 400,
    });
  });

  it('should return 500 for unexpected errors in production mode', async () => {
    // Mock console.error to suppress error logs
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(errorApp).get('/unexpected-error');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      data: null,
      message: 'An unexpected error occurred. Please try again later.',
      statusCode: 500,
    });
    expect(res.body.stack).toBeUndefined(); // No stack trace in production

    // Optionally, verify that console.error was called correctly
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error:',
      expect.stringContaining('Unexpected error')
    );

    // Restore the original console.error implementation
    consoleSpy.mockRestore();
  });

  it('should include stack trace in development mode', async () => {
    process.env.DEV_STATE = 'development';

    // Mock console.error to suppress error logs
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(errorApp).get('/unexpected-error');

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe(
      'An unexpected error occurred. Please try again later.'
    );
    expect(res.body.stack).toBeDefined(); // Stack trace should be included

    // Optionally, verify that console.error was called correctly
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error:',
      expect.stringContaining('Unexpected error')
    );

    // Restore the original console.error implementation
    consoleSpy.mockRestore();
  });

  it('should not interfere with valid routes', async () => {
    const res = await request(errorApp).get('/no-error');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'All good!' });
  });

  it('should log errors in development mode', async () => {
    process.env.DEV_STATE = 'development';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await request(errorApp).get('/unexpected-error');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error:',
      expect.stringContaining('Unexpected error')
    );

    consoleSpy.mockRestore();
  });

  it('should not log errors in production for AppErrors', async () => {
    process.env.DEV_STATE = 'production';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await request(errorApp).get('/status-error');

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

// ----------------   AUTHENTICATE   ----------------

// Mock JWT secret
const JWT_SECRET = 'test_secret';
const validToken = jwt.sign({ username: 'lodor', roles: [] }, JWT_SECRET, {
  expiresIn: '1h',
});
const expiredToken = jwt.sign({ username: 'lodor', roles: [] }, JWT_SECRET, {
  expiresIn: '-1h',
});

// Set up express app with middleware
const roleApp = express();
roleApp.use(express.json());
roleApp.use(cookieParser());

// Routes using the `authenticate` middleware
roleApp.get('/user', authenticate(), (req: Request, res: Response) => {
  res.status(200).json({ username: req.user?.username });
});

// Routes using the `role` middleware
roleApp.get(
  '/admin',
  authenticate(),
  role(['admin']),
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome, admin!' });
  }
);

roleApp.get(
  '/user-or-admin',
  authenticate(),
  role(['user', 'admin']),
  (req: Request, res: Response) => {
    res.status(200).json({ message: `Welcome, ${req.user?.username}!` });
  }
);

roleApp.use(errorHandler);

describe('Authenticate Middleware', () => {
  beforeEach(() => {
    // Ensure each test starts fresh
    process.env.JWT_KEY = JWT_SECRET;
  });

  it('should respond with 401 if no token is provided', async () => {
    const response = await request(roleApp).get('/user');
    expect(response.body).toEqual({
      status: 'error',
      data: null,
      message: 'Authentication token not provided.',
      statusCode: 401,
    });
  });

  it('should respond with 200 and user object for a valid token', async () => {
    const response = await request(roleApp)
      .get('/user')
      .set('Cookie', `token=${validToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ username: 'lodor' });
  });

  it('should respond with 403 for an invalid token', async () => {
    const response = await request(roleApp)
      .get('/user')
      .set('Cookie', `token=invalid_token`);
    expect(response.body).toEqual({
      data: null,
      message: 'Invalid or expired token.',
      status: 'error',
      statusCode: 403,
    });
  });

  it('should respond with 403 for an expired token', async () => {
    const response = await request(roleApp)
      .get('/user')
      .set('Cookie', `token=${expiredToken}`);
    expect(response.body).toEqual({
      data: null,
      message: 'Invalid or expired token.',
      status: 'error',
      statusCode: 403,
    });
  });
});

// ----------------   ROLE   ----------------

// Mock roles
const validAdminToken = jwt.sign(
  { username: 'adminUser', roles: ['admin'] },
  JWT_SECRET,
  {
    expiresIn: '1h',
  }
);
const validUserToken = jwt.sign(
  { username: 'regularUser', roles: ['user'] },
  JWT_SECRET,
  {
    expiresIn: '1h',
  }
);

describe('Role middleware', () => {
  beforeEach(() => {
    process.env.JWT_KEY = JWT_SECRET;
  });

  it('should respond with 403 if the user does not have the required role', async () => {
    const response = await request(roleApp)
      .get('/admin')
      .set('Cookie', `token=${validUserToken}`);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'error',
      data: null,
      message: 'Permission denied.',
      statusCode: 403,
    });
  });

  it('should respond with 200 if the user has the required role', async () => {
    const response = await request(roleApp)
      .get('/admin')
      .set('Cookie', `token=${validAdminToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Welcome, admin!' });
  });

  it('should respond with 200 if the user has one of the allowed roles', async () => {
    const response = await request(roleApp)
      .get('/user-or-admin')
      .set('Cookie', `token=${validUserToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Welcome, regularUser!' });
  });

  it('should respond with 401 if no token is provided', async () => {
    const response = await request(roleApp).get('/admin');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'error',
      data: null,
      message: 'Authentication token not provided.',
      statusCode: 401,
    });
  });
});
