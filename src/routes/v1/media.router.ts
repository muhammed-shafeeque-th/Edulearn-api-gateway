import { mediaRouter } from '../../domains/media/routers/v1/media.router';
import { Router } from 'express';

const router = Router();
router.use('/media', mediaRouter);

export { router as mediaRouterV1 };
