import { Router, Request, Response } from 'express';

import bcrypt from 'bcryptjs';

import { UserCrud } from '@services/userCrud';

import { UserInput, AuthResponse, User, SuccessResponse } from '@type/index';

import {
  validateSignUpFields,
  validateSignInFields,
} from '@api/authentication/utils';
import {
  asyncHandler,
  checkUniqueUser,
  generateToken,
  UserError,
  verifyToken,
} from '@utils/index';

import dotenv from 'dotenv';
import { generateRefresh } from '@utils/jwt/generateToken';
dotenv.config();

const router = Router();
/**
 * @route POST auth/sign-up
 * @async
 *
 * Create a new user account
 *
 * TODO: Send auth email
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

    const fullUserObject: User = await UserCrud.create(partialUserObject);

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
      throw new UserError(
        'Error while trying to sign-in. Invalid credentials.',
        401
      );
    }

    // Check if the passwords match
    const isMatch = await bcrypt.compare(req.body.password, dbUser.password);
    if (!isMatch) {
      throw new UserError(
        'Error while trying to sign-in. Invalid credentials.',
        401
      );
    }

    // Generate the JWT token
    const { password, ...userWithoutPassword } = dbUser;
    const jwtToken = generateToken(userWithoutPassword);
    const refreshToken = generateRefresh(userWithoutPassword);

    // Return the JWT in a cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      sameSite: process.env.STATE === 'PRODUCTION' ? 'none' : 'lax',
      secure: process.env.STATE === 'PRODUCTION',
      domain:
        process.env.STATE === 'PRODUCTION'
          ? '.projectcatalog.click'
          : undefined,
      maxAge: 30 * 60 * 1000,
    });

    // Return the JWT refresh token in a cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: process.env.STATE === 'PRODUCTION' ? 'none' : 'lax',
      secure: process.env.STATE === 'PRODUCTION',
      domain:
        process.env.STATE === 'PRODUCTION'
          ? '.projectcatalog.click'
          : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

export default router;
