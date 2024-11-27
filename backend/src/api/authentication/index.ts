import { Router, Request, Response } from 'express';

import {
  asyncHandler,
  isValidString,
  UserError,
  isValidEmail,
} from '@utils/index';

import dotenv from 'dotenv';
import { validatePassword } from '@utils/validatePassword';
import { UserCrud } from '@services/userCrud';
import { UserInput, AuthResponse, User } from '@type/index';

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
    // Check for fields that are missing
    const invalidFields = ['username', 'password', 'email'].filter(
      (field: string) => {
        const value = req.body[field];
        return !isValidString(value);
      }
    );

    // Throw error in case of missing fields
    if (invalidFields.length > 0) {
      throw new UserError(
        `Missing following fields: ${invalidFields.join(', ')}.`,
        400
      );
    }

    // Throw error in case of invalid email format
    if (!isValidEmail(req.body.email)) {
      throw new UserError('Invalid email format.', 400);
    }

    // Throw error in case of an invalid password
    const validationResponse = validatePassword(req.body.password);
    if (validationResponse !== '') {
      throw new UserError(validationResponse, 400);
    }

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

export default router;
