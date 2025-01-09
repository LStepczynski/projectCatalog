import jwt from 'jsonwebtoken';
import { JwtPayload } from '@type/index';

import dotenv from 'dotenv';
dotenv.config();

/**
 * Generates a JSON Web Token (JWT) for authentication.
 *
 * @param {JwtPayload} payload - The data to encode in the JWT, typically containing user-specific details (e.g., ID, username).
 *
 * @returns {string} The generated JWT.
 */
export const generateToken = (payload: JwtPayload) => {
  const secret = process.env.JWT_KEY || 'default';
  if (secret == 'default') {
    console.warn('\n!!! SECRET TOKEN FOR JWT NOT DEFINED !!!\n');
  }
  const options = { expiresIn: '30m' };
  return jwt.sign(payload, secret, options);
};

/**
 * Generates a refresh JSON Web Token (JWT) for authentication.
 *
 * @param {JwtPayload} payload - The data to encode in the JWT, typically containing user-specific details (e.g., ID, username).
 *
 * @returns {string} The generated JWT.
 */
export const generateRefresh = (payload: JwtPayload) => {
  const secret = process.env.JWT_REFRESH_KEY || 'refresh';
  if (secret == 'refresh') {
    console.warn('\n!!! SECRET TOKEN FOR JWT NOT DEFINED !!!\n');
  }
  const options = { expiresIn: '3d' };
  return jwt.sign(payload, secret, options);
};
