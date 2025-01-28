import { JwtPayload } from '@type/jwtPayload';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
