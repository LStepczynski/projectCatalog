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
export const generateToken = (payload: jwt.JwtPayload) => {
  const secret = process.env.JWT_KEY || 'default';
  const expireAfter = Number(process.env.JWT_EXPIRATION) || 0.5;

  if (secret === 'default') {
    console.warn('\n!!! SECRET TOKEN FOR JWT NOT DEFINED !!!\n');
  }

  // Calculate the expiration time as a UNIX timestamp
  const expirationTime = Math.floor(Date.now() / 1000) + expireAfter * 60 * 60;

  // Add the exp property to the payload
  const tokenPayload = {
    ...payload,
    exp: expirationTime,
  };

  return jwt.sign(tokenPayload, secret);
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
  const expireAfter = Number(process.env.JWT_REFRESH_EXPIRATION) || 72;

  if (secret == 'refresh') {
    console.warn('\n!!! SECRET TOKEN FOR JWT NOT DEFINED !!!\n');
  }

  const expirationTime = Math.floor(Date.now() / 1000) + expireAfter * 60 * 60;

  const tokenPayload = {
    ...payload,
    exp: expirationTime,
  };

  return jwt.sign(tokenPayload, secret);
};
