import { Router, Request, Response } from 'express';

import dotenv from 'dotenv';

import { asyncHandler } from '@utils/asyncHandler';

import { UserError, InternalError } from '@utils/statusError';

dotenv.config();

const router = Router();

router.get(
  '/errorTest',
  asyncHandler((req: Request, res: Response) => {
    // throw new SyntaxError('custom error message');
    throw new UserError('testwwwwwError', 500, ['testDetao;']);
    // throw new InternalError('testwwwwwError', 500, ['testDetails']);
    res.json({ status: 'ok' });
  })
);

export default router;
