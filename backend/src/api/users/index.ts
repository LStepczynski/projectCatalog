import { Router, Request, Response } from 'express';

import bcrypt from 'bcryptjs';

import dotenv from 'dotenv';
import { asyncHandler } from '@utils/asyncHandler';
import { authenticate, role } from '@utils/middleware';
import { InternalError, UserError } from '@utils/statusError';
import { UserCrud } from '@services/userCrud';
import { UserService } from '@services/userService';
import {
  getUnixTimestamp,
  setAuthCookies,
  validatePassword,
} from '@utils/index';
import { AuthResponse } from '@type/authResponse';
import { SuccessResponse } from '@type/successResponse';
dotenv.config();

const router = Router();

/**
 * Updates the authenticated user's password after validating the provided old and new passwords.
 * Ensures the old password matches the stored password and updates the password with the hashed new password.
 *
 * @route PUT users/change-password
 * @middleware authenticate - Ensures the user is authenticated.
 * @middleware role - Restricts access to users with the 'verified' role.
 *
 * @throws {UserError} - If the old or new password is missing, invalid, or if the old password does not match.
 * @throws {UserError} - If the user does not exist.
 * @throws {InternalError} - If an error occurs while updating the user's password in the database.
 * @returns {SuccessResponse<null>} - A success message with HTTP status code 200.
 */
router.put(
  '/change-password',
  authenticate(),
  role(['verified']),
  asyncHandler(async (req: Request, res: Response) => {
    // Verify if both passwords are of a valid format
    const oldPassword = req.body.oldPassword;
    if (typeof oldPassword != 'string' || validatePassword(oldPassword) != '') {
      throw new UserError('Missing or invalid old password.', 400);
    }

    const newPassword = req.body.newPassword;
    if (typeof newPassword != 'string' || validatePassword(newPassword) != '') {
      throw new UserError('Missing or invalid new password.', 400);
    }

    // Fetch user
    const user = await UserCrud.get(req.user!.username);
    if (user == null) {
      throw new UserError('User does not exist.', 404);
    }

    // Check if the passwords match
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UserError('Missing or invalid new password.', 400);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const result = await UserCrud.update(user.username, {
      password: hashedPassword,
      lastPasswordChange: getUnixTimestamp(),
    });
    if (result == null) {
      throw new InternalError(
        'Error while updating the user in the database',
        500,
        ['/change-password']
      );
    }

    // Send a response
    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: 'The password was successfuly updated.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * Changes the user's profile picture, enforcing a cooldown period between updates.
 *
 * @route PUT users/change-icon
 * @middleware authenticate - Ensures the user is authenticated.
 * @middleware role - Restricts access to users with the 'verified' role.
 *
 * @throws {UserError} - If the `profilePicture` property is missing or invalid,
 *                       if the user does not exist, or if the cooldown period has not elapsed.
 * @returns {AuthResponse<null>} - A success message with the updated authentication cookies.
 */
router.put(
  '/change-icon',
  authenticate(),
  role(['verified']),
  asyncHandler(async (req: Request, res: Response) => {
    // Check if body.profilePicture is a string
    if (typeof req.body.profilePicture != 'string') {
      throw new UserError('Missing or invalid profilePicture property.', 400);
    }

    // Fetch user
    const user = await UserCrud.get(req.user!.username);
    if (user == null) {
      throw new UserError('User does not exist.', 404);
    }

    // Check if the user recently changed their profile
    const cooldown = 3; // Cooldown in days
    if (user.lastPictureChange + cooldown * 24 * 60 * 60 > getUnixTimestamp()) {
      throw new UserError(
        `Profile picture changed in the last ${cooldown} days`,
        403
      );
    }

    const newUser = await UserService.changeProfile(
      user,
      req.body.profilePicture
    );

    // Send auth cookies
    const { password, ...userWithoutPassword } = newUser;
    setAuthCookies(userWithoutPassword, res);

    const response: AuthResponse<null> = {
      status: 'success',
      data: null,
      message: 'Profile picture successfuly changed.',
      statusCode: 200,
      auth: {
        user: userWithoutPassword,
      },
    };

    res.status(response.statusCode).send(response);
  })
);

/**
 * Deletes the authenticated user's account after verifying their password.
 * Removes all associated articles and clears authentication cookies.
 *
 * @route DELETE users/delete-account
 * @middleware authenticate - Ensures the user is authenticated.
 *
 * @throws {UserError} - If the password is missing, invalid, or does not match the stored password.
 * @throws {UserError} - If the user does not exist.
 * @returns {SuccessResponse<null>} - A success message with HTTP status code 200.
 */
router.delete(
  '/delete-account',
  authenticate(),
  asyncHandler(async (req: Request, res: Response) => {
    // Verify if the provided password is of a valid format
    const password = req.body.password;
    if (typeof password != 'string' || validatePassword(password) != '') {
      throw new UserError('Missing or invalid password.', 400);
    }

    // Fetch user
    const user = await UserCrud.get(req.user!.username);
    if (user == null) {
      throw new UserError('User does not exist.', 404);
    }

    // Check if the passwords match
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      throw new UserError('Missing or password.', 400);
    }

    // Delete user along with all of their articles
    await UserService.deleteUserAccount(user);

    // Remove the cookies from the user's browser
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    // Send a response
    const response: SuccessResponse<null> = {
      status: 'success',
      data: null,
      message: 'Account successfuly deleted.',
      statusCode: 200,
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
