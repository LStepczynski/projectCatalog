import { Router, Request, Response } from 'express';

import { UserCrud } from '@services/userCrud';

import { UserInput, AuthResponse, User, SuccessResponse } from '@type/index';

import { validateSignFields } from '@api/authentication/utils';

import { asyncHandler, checkUniqueUser, UserError } from '@utils/index';

import dotenv from 'dotenv';
dotenv.config();

const router = Router();
/**
 * @route POST auth/sign-up
 * @async
 *
 * Create a new user account
 *
 * TODO: Return JWT
 * TODO: Return auth cookies
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
    validateSignFields(req.body);

    // Check if the email and username are unique
    await checkUniqueUser(req.body.username, req.body.email);

    // Construct the request and send it
    const partialUserObject: UserInput = {
      username: req.body.username,
      password: req.body.password,
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
 * Handles user sign-in by validating credentials and returning authentication data.
 *
 * @TODO: Check password hash
 * @TODO: implement JWT
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
    validateSignFields(req.body);

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
    if (dbUser.password != req.body.password) {
      throw new UserError(
        'Error while trying to sign-in. Invalid credentials.',
        401
      );
    }

    // Return response
    const response: AuthResponse<null> = {
      status: 'success',
      data: null,
      message: 'User account successfully created.',
      statusCode: 201,
      auth: {
        token: '',
        user: dbUser,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
