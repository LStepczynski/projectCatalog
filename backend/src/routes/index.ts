import { Request, Response, Router } from 'express';

import articles from './v1/articles';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('Health check');
});

router.use('/articles', articles);

export default router;
