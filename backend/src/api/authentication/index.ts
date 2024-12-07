import { Router, Request, Response } from 'express';

import { UserCrud } from '@services/userCrud';

import { UserInput, AuthResponse, User } from '@type/index';

import { validateSignFields } from '@api/authentication/utils';

import { asyncHandler, checkUniqueUser } from '@utils/index';

import dotenv from 'dotenv';
dotenv.config();

const router = Router();
/**
 * Create a new user account
 * TODO: Check if the email is taken
 * TODO: Check if the username is taken
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

    const response: AuthResponse<null> = {
      status: 'success',
      data: null,
      message: 'User account successfully created.',
      statusCode: 200,
      auth: {
        token: '',
        user: fullUserObject,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

router.post(
  '/sign-in',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate fields
    validateSignFields(req.body);
  })
);

export default router;
