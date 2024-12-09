import { User } from './user';

export interface JwtPayload extends Omit<User, 'password'> {
  iat?: number;
  exp?: number;
}
