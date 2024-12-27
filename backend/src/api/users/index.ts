import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';
import { asyncHandler } from '@utils/asyncHandler';
import { authenticate, role } from '@utils/middleware';
import { UserError } from '@utils/statusError';
import { UserCrud } from '@services/userCrud';
import { UserService } from '@services/userService';
import { getUnixTimestamp, setAuthCookies } from '@utils/index';
import { AuthResponse } from '@type/authResponse';
dotenv.config();

const router = Router();

/**
 * Changes the user's profile picture, enforcing a cooldown period between updates.
 *
 * @route POST users/change-icon
 * @middleware authenticate - Ensures the user is authenticated.
 * @middleware role - Restricts access to users with the 'verified' role.
 *
 * @throws {UserError} - If the `profilePicture` property is missing or invalid,
 *                       if the user does not exist, or if the cooldown period has not elapsed.
 * @returns {AuthResponse<null>} - A success message with the updated authentication cookies.
 */
router.post(
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
      throw new UserError('User does not exits', 404);
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

export default router;
