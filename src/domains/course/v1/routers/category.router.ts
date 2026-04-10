import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CourseController } from '../controllers/course.controller';
import { CategoryController } from '../controllers/category.controller';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { Permissions } from '@/shared/types';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { container, TYPES } from '@/services/di';

const router = Router();

const categoryController = container.get<CategoryController>(
  TYPES.CategoryController
);

//  ============================================================================
//                              CATEGORY ROUTES
//  ============================================================================

router.get(
  '/categories',
  asyncHandler(categoryController.getAllCategories.bind(categoryController))
);
router.get(
  '/categories/stats',
  asyncHandler(categoryController.getCategoriesStats.bind(categoryController))
);

// Admin-only: create a category
router.post(
  '/categories',
  authGuard({ roles: ['admin'], permissions: [Permissions.CATEGORY_MANAGE] }),
  asyncHandler(categoryController.createCategory.bind(categoryController))
);

// Admin-only: update a category
router.patch(
  '/categories/:id',
  authGuard({ roles: ['admin'], permissions: [Permissions.CATEGORY_MANAGE] }),
  asyncHandler(categoryController.updateCategory.bind(categoryController))
);

// Admin-only: toggle active/inactive status
router.patch(
  '/categories/:id/toggle-status',
  authGuard({ roles: ['admin'], permissions: [Permissions.CATEGORY_MANAGE] }),
  asyncHandler(categoryController.toggleCategoryStatus.bind(categoryController))
);

// Admin-only: soft-delete a category
router.delete(
  '/categories/:id',
  authGuard({ roles: ['admin'], permissions: [Permissions.CATEGORY_MANAGE] }),
  blocklistMiddleware,
  asyncHandler(categoryController.deleteCategory.bind(categoryController))
);

export { router as categoryRouter };
