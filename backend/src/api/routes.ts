import { Request, Response, Router } from 'express';

import articleManipulationRoute from '@api/articleManipulation';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('Health check');
});

router.use('/articles', articleManipulationRoute);

export default router;
