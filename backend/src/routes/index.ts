import { Request, Response, Router } from 'express';

import v1 from './v1/index';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('Health check');
});

router.use('/test', v1);

export default router;
