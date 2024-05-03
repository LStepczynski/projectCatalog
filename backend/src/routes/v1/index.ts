import { Router } from 'express';

const router = Router();

router.get('/', (req: any, res: any) => {
  res.status(200).json('Test');
});

export default router;
