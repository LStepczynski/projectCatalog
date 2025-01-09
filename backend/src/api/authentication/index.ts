import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

import { UserService } from '@services/userService';
import { UserCrud } from '@services/userCrud';
import { Tokens } from '@services/token';

import {
  UserInput,
  AuthResponse,
  User,
  SuccessResponse,
  Token,
} from '@type/index';

import {
  asyncHandler,
  checkUniqueUser,
  generateToken,
  authenticate,
  UserError,
  verifyToken,
  setAuthCookies,
  getUnixTimestamp,
} from '@utils/index';

import {
  validateSignUpFields,
  validateSignInFields,
} from '@api/authentication/utils';

import dotenv from 'dotenv';
import { Email } from '@services/email';
import { randString } from '@utils/randString';
dotenv.config();

const router = Router();

/**
 * @route POST auth/sign-up
 * @async
 *
 * Create a new user account
 *
 * @param {string} req.body.username
 * @param {string} req.body.password
 * @param {string} req.body.email
 */
router.post(
  '/sign-up',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate fields
    validateSignUpFields(req.body);

    // Check if the email and username are unique
    await checkUniqueUser(req.body.username, req.body.email);

    // Hash the password with 10 rounds
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Construct the request and send it
    const partialUserObject: UserInput = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
    };

    const user = await UserCrud.create(partialUserObject);

    const verificationToken: Token = {
      username: user.username,
      type: 'verification',
      content: uuid(),
      expiration: getUnixTimestamp() + 60 * 60 * 24,
    };

    await Tokens.createToken(verificationToken);

    await Email.sendAccountVerificationEmail(
      user.email,
      verificationToken.username,
      verificationToken.content
    );

    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: 'User account successfully created.',
      statusCode: 201,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route POST auth/sign-in
 * @async
 *
 * Handles user sign-in by validating credentials and returning authentication data.
 *
 * @TODO: Add the expiration to the returned user object itself [?]
 *
 * @param {string} req.body.username - The username provided by the user.
 * @param {string} req.body.password - The password provided by the user.
 *
 * @throws {UserError} 401 - Invalid credentials if user is not found or password mismatch.
 *
 * @response 201 - Returns success status, user data, and placeholder token.
 * @response 401 - Returns error message for invalid credentials.
 */
router.post(
  '/sign-in',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate fields
    validateSignInFields(req.body);

    // Fetch user
    const dbUser: User | null = await UserCrud.get(req.body.username);

    // Check if the user exists
    if (dbUser == null) {
      throw new UserError('Invalid credentials.', 401);
    }

    // Check if the passwords match
    const isMatch = await bcrypt.compare(req.body.password, dbUser.password);
    if (!isMatch) {
      throw new UserError('Invalid credentials.', 401);
    }

    // Generate the JWT token
    const { password, ...userWithoutPassword } = dbUser;
    setAuthCookies(userWithoutPassword, res);

    // Return response
    const response: AuthResponse<null> = {
      status: 'success',
      data: null,
      message: 'Successfully signed in.',
      statusCode: 200,
      auth: {
        user: userWithoutPassword,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route GET auth/refresh
 * @async
 *
 * Endpoint to refresh the user's authentication token.
 *
 * @description Verifies the provided refresh token, generates a new authentication token, and sets it in an HTTP-only cookie.
 *
 * @throws {UserError} 401 - If the refresh token is missing or invalid.
 *
 * @response {200} - Token refresh successful. Returns a new access token and user information.
 * @response {401} - Missing or invalid refresh token.
 */
router.get(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    // Check for the refresh token
    if (!req.cookies.refreshToken) {
      throw new UserError('Missing refresh token.', 401);
    }

    // remove the `exp` and `iat` properties
    const { exp, iat, ...payload } = verifyToken(
      req.cookies.refreshToken,
      true
    );

    // Generate a new access token
    const newToken = generateToken(payload);

    // Return the JWT access token in a cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      sameSite: process.env.STATE === 'PRODUCTION' ? 'none' : 'lax',
      secure: process.env.STATE === 'PRODUCTION',
      domain:
        process.env.STATE === 'PRODUCTION'
          ? '.projectcatalog.click'
          : undefined,
      maxAge: 30 * 60 * 1000,
    });

    // Return the response
    const response: AuthResponse<null> = {
      status: 'success',
      data: null,
      message: 'Token refresh successful.',
      statusCode: 200,
      auth: {
        user: payload,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * @route POST auth/password-reset
 * @async
 *
 * @TODO: Check if the user has requested a password reset recently
 *
 * Endpoint to initiate a password reset process for a user.
 *
 * @description Validates the provided username, checks if the user exists, generates a password reset token, sends a password reset email, and removes the
 * token for security. If the username is invalid or the user does not exist, the response does not reveal user information for security purposes.
 *
 * @throws {UserError} 400 - If the provided username is invalid.
 *
 * @response {200} - Password reset request successful. If the user exists, a password reset email has been sent.
 */
router.post(
  '/password-reset',
  asyncHandler(async (req: Request, res: Response) => {
    // Validations
    if (typeof req.body.username != 'string' || req.body.username == '') {
      throw new UserError('Invalid username.');
    }

    // Declare a generic response
    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: 'If the user exists, a password reset email has been sent.',
      statusCode: 200,
    };

    // Fetch the user
    const user = await UserCrud.get(req.body.username);
    if (user == null) {
      return res.status(response.statusCode).send(response);
    }

    // Create a password reset token
    const token: Token = {
      username: user.username,
      content: uuid(),
      type: 'password-reset',
      expiration: getUnixTimestamp() + 60 * 60 * 3, // 3h
    };
    await Tokens.createToken(token);

    // Send an email with the reset link
    await Email.sendPasswordResetEmail(
      user.email,
      user.username,
      token.content
    );

    return res.status(response.statusCode).send(response);
  })
);

/**
 * @route POST auth/password-reset/:token
 * @async
 *
 * Endpoint to reset the user's password using a password reset token.
 *
 * @description Validates the provided password reset token, checks for expiration, generates a new random password, updates the user's password in the database,
 * and sends an email with the new password to the user. If the token is invalid, expired, or the user cannot be updated, an error is thrown.
 *
 * @param {string} req.params.token - The password reset token provided in the URL.
 *
 * @throws {UserError} 400 - If the token is invalid, expired, or the user cannot be updated.
 *
 * @response {200} - Password reset successful. An email with the new password has been sent to the user.
 */
router.post(
  '/password-reset/:token',
  asyncHandler(async (req: Request, res: Response) => {
    // Check if the token is a uuid
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        req.params.token
      );
    if (!isUuid) {
      throw new UserError('Invalid or expired password reset token.', 400);
    }

    // Check if the verification token exists
    const token = await Tokens.getToken(req.params.token);
    if (token == null) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Check for expiration
    if (token.expiration < getUnixTimestamp()) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Generate a new password and hash it
    const newPassword = randString(12);
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const user = await UserCrud.update(token.username, {
      password: newHashedPassword,
    });
    if (user == null) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Send an email with the new password to the user
    await Email.sendNewPasswordEmail(user.email, user.username, newPassword);

    // Delete the token after use
    await Tokens.deleteToken(token.content);

    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: 'An email with a new password has been sent.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * GET auth/verify/resend
 *
 * Resends a verification email to the user if their account is not already verified.
 * This route generates a new verification token, stores it in the database, and sends
 * it to the user's registered email address.
 *
 * Response:
 * - Status: 200 (OK)
 * - Body: A success message confirming the email was sent.
 *
 * Errors:
 * - 400: If the account is already verified (both via JWT and database).
 * - 404: If the account does not exist in the database.
 * - 500: If there is an internal server error during token creation or email sending.
 */
router.get(
  '/verify/resend',
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    // Check if the user is already verified according to their JWT
    if (req.user?.roles.includes('verified')) {
      throw new UserError('Account already verified', 400);
    }

    // Fetch the user from the database
    const user = await UserCrud.get(req.user!.username);
    if (user == null) {
      throw new UserError('Account does not exist');
    }

    // Check if the user is already verified against the database
    // to prevent the usage of old JWT tokens
    if (user.roles.includes('verified')) {
      throw new UserError('Account already verified', 400);
    }

    // Create the token
    const verificationToken: Token = {
      username: user.username,
      type: 'verification',
      content: uuid(),
      expiration: getUnixTimestamp() + 60 * 60 * 24,
    };

    await Tokens.createToken(verificationToken);

    // Send the verification email
    await Email.sendAccountVerificationEmail(
      user.email,
      user.username,
      verificationToken.content
    );

    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: 'Verification email was successfuly sent.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * GET auth/verify/:token
 *
 * Verifies a user's account using a unique verification token. If the token is valid,
 * the user's "verified" role is added, the token is deleted, and the user's session cookies
 * are set. The route returns a success response upon successful verification.
 *
 * @param {string} token - The unique verification token passed as a route parameter.
 *
 * Response:
 * - Status: 200 (OK)
 * - Body: A success message and the user's data without sensitive fields (e.g., password).
 *
 * Errors:
 * - 400: If the token is invalid, expired, or does not match the authenticated user.
 * - 500: Internal server error for unexpected issues.
 */
router.get(
  '/verify/:token',
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    // Check if the user is already verified
    if (req.user?.roles.includes('verified')) {
      throw new UserError('Account already verified', 400);
    }

    // Check if the token is a uuid
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        req.params.token
      );
    if (!isUuid) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Check if the verification token exists
    const token = await Tokens.getToken(req.params.token);
    if (token == null) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Check if the token belongs to the user
    if (token.username != req.user?.username) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Check for expiration
    if (token.expiration < getUnixTimestamp()) {
      throw new UserError('Invalid or expired verification token.', 400);
    }

    // Append the verification role to the user
    const newUser = await UserService.appendRoleToUser(
      req.user.username,
      'verified'
    );

    // Delete the used token
    await Tokens.deleteToken(req.params.token);

    // Send the auth response and new JWT tokens in a cookie
    const { password, ...userWithoutPassword } = newUser;
    setAuthCookies(userWithoutPassword, res);

    const response: AuthResponse<null> = {
      status: 'success',
      data: null,
      message: 'Successfully verified the account.',
      statusCode: 200,
      auth: {
        user: userWithoutPassword,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
