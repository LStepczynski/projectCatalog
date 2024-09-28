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
   * Forgot Password rate limiter: 1 requests per 10 minutes per IP.
   */
  public static forgotPassword: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 20 minutes
    max: 1, // Limit each IP to 1 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many password reset requests. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Password reset rate limiter: 6 requests per 10 minutes per IP.
   */
  public static passwordReset: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 6, // Limit each IP to 6 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many password reset requests. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Email verification rate limiter: 10 requests per 5 minutes per IP.
   */
  public static emailVerification: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many email verification attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Article Creation/Change rate limiter: 16 requests per 25 minutes per IP.
   * For adding new articles or editing their content
   */
  public static articleCreationChange: RateLimitRequestHandler = rateLimit({
    windowMs: 25 * 60 * 1000, // 25 minutes
    max: 16, // Limit each IP to 16 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many article actions. Please try again later.' },
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
    max: 20, // Limit each IP to 20 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many article actions. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Login rate limiter: 15 requests per 5 minutes per IP.
   */
  public static login: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15, // Limit each IP to 15 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many login attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Register rate limiter: 3 requests per 30 minutes per IP.
   */
  public static register: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many registration attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Register rate limiter: 1 request per 60 minutes per IP.
   */
  public static profileChange: RateLimitRequestHandler = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 1, // Limit each IP to 1 request per windowMs
    message: {
      status: 429,
      response: { message: 'Too many profile picture change attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Register rate limiter: 10 requests per 30 minutes per IP.
   */
  public static tokenRefresh: RateLimitRequestHandler = rateLimit({
    windowMs: 30 * 60 * 1000, // 60 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many token refresh attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Register rate limiter: 40 requests per 5 minutes per IP.
   */
  public static like: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 1000, // 60 minutes
    max: 40, // Limit each IP to 40 requests per windowMs
    message: {
      status: 429,
      response: { message: 'Too many article like attempts. Please try again later.' },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}
