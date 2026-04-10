import { asyncHandler } from '@/shared/utils/async-handler';
import { UserController } from '../controllers/user.controller';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { invalidateCacheMiddleware } from '@/middlewares/cache.invalidation.middleware';
import { container, TYPES } from '@/services/di';
import { InstructorController } from '../controllers/instructor.controller';

const router = Router();

const instructorController = container.get<InstructorController>(
  TYPES.UserController
);

router.get(
  '/me/students',
  authGuard({ roles: ['instructor'] }),
  asyncHandler(
    instructorController.listStudentsOfInstructor.bind(instructorController)
  )
);

router.get(
  '/',
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.listInstructors(req.query),
  //   () => ['instructors:list']
  // ),
  asyncHandler(instructorController.listInstructors.bind(instructorController))
);

router.get(
  '/stats',
  authGuard({ roles: ['admin'] }),
  // cacheMiddleware(
  //   120,
  //   req => RESPONSE_CACHE_KEYS.userService.getInstructorsStats(),
  //   () => ['instructors:stats']
  // ),
  asyncHandler(
    instructorController.getInstructorsStats.bind(instructorController)
  )
);

router.post(
  '/register',
  authGuard(),
  // invalidateCacheMiddleware(req => ['instructors:list', 'instructors:stats']),
  asyncHandler(
    instructorController.registerInstructor.bind(instructorController)
  )
);

router.get(
  '/:instructorId/stats',
  authGuard({ roles: ['instructor', 'admin'] }),
  // cacheMiddleware(
  //   120,
  //   req =>
  //     RESPONSE_CACHE_KEYS.userService.getInstructorStats(
  //       req.params.instructorId
  //     ),
  //   req => [`instructor:${req.params.instructorId}:stats`]
  // ),
  asyncHandler(
    instructorController.getInstructorStats.bind(instructorController)
  )
);

router.get(
  '/:instructorId/courses/stats',
  authGuard({ roles: ['instructor', 'admin'] }),
  // cacheMiddleware(
  //   120,
  //   req =>
  //     RESPONSE_CACHE_KEYS.userService.getInstructorCoursesStats(
  //       req.params.instructorId
  //     ),
  //   req => [`instructor:${req.params.instructorId}:courses:stats`]
  // ),
  asyncHandler(
    instructorController.getInstructorCoursesStats.bind(instructorController)
  )
);

router.get(
  '/:instructorId/courses/:courseId/stats',
  authGuard({ roles: ['instructor', 'admin'] }),
  // cacheMiddleware(
  //   120,
  //   req =>
  //     RESPONSE_CACHE_KEYS.courseService.getCourseAnalytics(
  //       req.params.courseId?.[0]!,
  //       req.query.year as string
  //     ),

  //   req => [`course:${req.params.courseId}`, `instructor:${req.user!.userId}`]
  // ),
  asyncHandler(
    instructorController.getInstructorCourseAnalytics.bind(instructorController)
  )
);

export { router as instructorRouterV1 };
