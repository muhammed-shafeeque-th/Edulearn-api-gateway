import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { courseRouter } from './course.router';
import { categoryRouter } from './category.router';

const router = Router();

router.use(categoryRouter)
router.use(courseRouter)

export {router as courseRouterV1}