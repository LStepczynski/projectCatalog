import { Request, Response, Router } from 'express';

import articles from './v1/articles';
import users from './v1/userapi';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('Health check');
});

router.use('/articles', articles);
router.use('/user', users);

export default router;
