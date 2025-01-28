import { Router } from 'express';

import compositionRoute from '@api/articles/composition';
import queryRoute from '@api/articles/query';

const router = Router();

router.use('/', compositionRoute);
router.use('/', queryRoute);

export default router;
