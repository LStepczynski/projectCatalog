import { Request, Response, Router } from 'express';

import articlesRoute from '@api/articles';
import authenticationRoute from '@api/authentication';
import testingRoute from '@api/testingRoutes';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('Health check');
});

router.use('/articles', articlesRoute);
router.use('/auth', authenticationRoute);
router.use('/test', testingRoute);

export default router;
