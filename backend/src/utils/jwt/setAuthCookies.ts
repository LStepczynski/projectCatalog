import { Response } from 'express';
import { generateToken, generateRefresh } from '@utils/jwt/generateToken';
import { User } from '@type/user';

/**
 * Helper to generate access and refresh JWT tokens and set them as cookies.
 *
 * @param user - The user object to encode in the JWT.
 * @param res - The Express response object to set cookies on.
 */
export const setAuthCookies = (
  user: Omit<User, 'password'>,
  res: Response
): void => {
  // Extract environment-specific settings
  const isProduction = process.env.STATE === 'PRODUCTION';
  const domain = isProduction ? '.projectcatalog.click' : undefined;

  // Generate JWT tokens
  const jwtToken = generateToken(user);
  const refreshToken = generateRefresh(user);

  // Set the access token cookie
  res.cookie('token', jwtToken, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    domain: domain,
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  // Set the refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    domain: domain,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
