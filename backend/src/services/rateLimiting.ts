import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export class RateLimiting {
  /**
   * General API rate limiter: 400 requests per 15 minutes per IP.
   */
  public static generalAPI: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 400, // Increased to allow more users from the same IP
    message: {
      status: 429,
      response: { message: 'Too many requests. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Forgot Password rate limiter: 3 requests per 15 minutes per IP.
   */
  public static forgotPassword: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // Increased window size to 15 minutes
    max: 3, // Allowing more requests but still limited for security
    message: {
      status: 429,
      response: {
        message: 'Too many password reset requests. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Account data change rate limiter: 50 requests per 30 minutes per IP.
   */
  public static accountDataChange: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 50, // Increased to allow for more changes from multiple users
    message: {
      status: 429,
      response: {
        message:
          'Too many account modification requests. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Article Creation/Change rate limiter: 40 requests per 30 minutes per IP.
   */
  public static articleCreationChange: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 40, // Increased to handle more users on the same IP
    message: {
      status: 429,
      response: {
        message: 'Too many article actions. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Article Creation/Edit rate limiter: 30 requests per 30 minutes per IP.
   */
  public static articleEdit: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 30, // Slight increase to handle multiple users
    message: {
      status: 429,
      response: {
        message: 'Too many article actions. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Login rate limiter: 30 requests per 10 minutes per IP.
   */
  public static login: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // Increased limit to handle multiple users on the same IP
    message: {
      status: 429,
      response: { message: 'Too many login attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Register rate limiter: 10 requests per 30 minutes per IP.
   */
  public static register: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // Allowing more registrations from the same IP
    message: {
      status: 429,
      response: {
        message: 'Too many registration attempts. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Profile change rate limiter: 10 requests per 60 minutes per IP.
   */
  public static profileChange: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 10, // Allowing more frequent profile changes
    message: {
      status: 429,
      response: {
        message:
          'Too many profile picture change attempts. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Token refresh rate limiter: 20 requests per 30 minutes per IP.
   */
  public static tokenRefresh: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 20, // Increased to handle more token refresh requests
    message: {
      status: 429,
      response: {
        message: 'Too many token refresh attempts. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Like rate limiter: 100 requests per 10 minutes per IP.
   */
  public static like: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Increased to allow more likes without spamming
    message: {
      status: 429,
      response: {
        message: 'Too many article like attempts. Please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}
