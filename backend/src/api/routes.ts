import { Request, Response, Router } from 'express';

import articlesRoute from '@api/articles';
import authenticationRoute from '@api/authentication';
import testingRoute from '@api/testingRoutes';
import userRoute from '@api/users';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  res.status(200).json('Health check');
});

router.use('/auth', authenticationRoute);
router.use('/articles', articlesRoute);
router.use('/users', userRoute);
router.use('/test', testingRoute);

export default router;
