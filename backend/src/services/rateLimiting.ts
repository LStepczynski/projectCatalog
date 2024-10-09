import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export class RateLimiting {
  /**
   * General API rate limiter: 100 requests per 15 minutes per IP.
   */
  public static generalAPI: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many requests. Please try again later.' },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  /**
   * Forgot Password rate limiter: 1 requests per 5 minutes per IP.
   */
  public static forgotPassword: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1,
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
   * Account data change rate limiter: 25 requests per 10 minutes per IP.
   */
  public static accountDataChange: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 25,
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
   * Article Creation/Change rate limiter: 20 requests per 15 minutes per IP.
   * For adding new articles or editing their content
   */
  public static articleCreationChange: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
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
   * Article Creation/Edit rate limiter: 20 requests per 10 minutes per IP.
   * For hiding, publishing, and deleting articles.
   */
  public static articleEdit: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20,
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
   * Login rate limiter: 15 requests per 5 minutes per IP.
   */
  public static login: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15,
    message: {
      status: 429,
      response: { message: 'Too many login attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Register rate limiter: 5 requests per 30 minutes per IP.
   */
  public static register: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5,
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
   * Profile change rate limiter: 5 requests per 60 minutes per IP.
   */
  public static profileChange: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 5,
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
   * Register rate limiter: 10 requests per 30 minutes per IP.
   */
  public static tokenRefresh: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 60 minutes
    max: 10,
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
   * Like rate limiter: 40 requests per 5 minutes per IP.
   */
  public static like: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000, // 60 minutes
    max: 40,
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
