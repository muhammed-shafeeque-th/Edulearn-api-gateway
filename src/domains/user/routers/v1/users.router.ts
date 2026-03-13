import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { UserController } from '../../controllers/v1/user.controller';
import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { invalidateCacheMiddleware } from '@/middlewares/cache.invalidation.middleware';
import { RESPONSE_CACHE_KEYS } from '@/services/redis/cache-keys';
import { container, TYPES } from '@/services/di';

const router = Router();

const userController = container.get<UserController>(TYPES.UserController);

router.get(
  '/',
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.listUsers(req.query),
  //   () => ['users:list']
  // ),
  asyncHandler(userController.getUsers.bind(userController))
);

router.get(
  '/stats',
  authenticate,
  // cacheMiddleware(
  //   300,
  //   () => RESPONSE_CACHE_KEYS.userService.getUsersStats(),
  //   () => ['users:stats']
  // ),
  asyncHandler(userController.getUsersStats.bind(userController))
);

router.get(
  '/online',
  authenticate,
  // cacheMiddleware(
  //   30,
  //   () => RESPONSE_CACHE_KEYS.userService.getOnlineUsers(),
  //   () => ['users:online']
  // ),
  asyncHandler(userController.getOnlineUsers.bind(userController))
);

router.get(
  '/username-check',
  asyncHandler(userController.checkUsername.bind(userController))
);


router.get(
  '/me',
  authenticate,
  blocklistMiddleware,
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.getUserById(req.user!.userId),
  //   req => [`user:${req.user!.userId}`]
  // ),
  asyncHandler(userController.getCurrentUser.bind(userController))
);

router.patch(
  '/me',
  authenticate,
  blocklistMiddleware,
  // invalidateCacheMiddleware(req => [
  //   `user:${req.user!.userId}`,
  //   'users:list', 
  // ]),
  asyncHandler(userController.updateCurrentUser.bind(userController))
);

router.get(
  '/me/instructors',
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.listInstructorsOfStudent.bind(userController))
);

router.get(
  '/me/students',
  authenticate,
  authorize(['instructor']),
  blocklistMiddleware,
  asyncHandler(userController.listStudentsOfInstructor.bind(userController))
);


router.get(
  '/instructors',
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.listInstructors(req.query),
  //   () => ['instructors:list']
  // ),
  asyncHandler(userController.listInstructors.bind(userController))
);

router.get(
  '/instructors/stats',
  authenticate,
  // cacheMiddleware(
  //   120,
  //   req => RESPONSE_CACHE_KEYS.userService.getInstructorsStats(),
  //   () => ['instructors:stats']
  // ),
  asyncHandler(userController.getInstructorsStats.bind(userController))
);

router.post(
  '/instructors/register',
  authenticate,
  blocklistMiddleware,
  // invalidateCacheMiddleware(req => ['instructors:list', 'instructors:stats']),
  asyncHandler(userController.registerInstructor.bind(userController))
);

router.get(
  '/instructors/:instructorId/stats',
  authenticate,
  authorize(['instructor', 'admin']),
  // cacheMiddleware(
  //   120,
  //   req =>
  //     RESPONSE_CACHE_KEYS.userService.getInstructorStats(
  //       req.params.instructorId
  //     ),
  //   req => [`instructor:${req.params.instructorId}:stats`]
  // ),
  asyncHandler(userController.getInstructorStats.bind(userController))
);

router.get(
  '/instructors/:instructorId/courses/stats',
  authenticate,
  authorize(['instructor', 'admin']),
  // cacheMiddleware(
  //   120,
  //   req =>
  //     RESPONSE_CACHE_KEYS.userService.getInstructorCoursesStats(
  //       req.params.instructorId
  //     ),
  //   req => [`instructor:${req.params.instructorId}:courses:stats`]
  // ),
  asyncHandler(userController.getInstructorCoursesStats.bind(userController))
);

router.get(
  '/instructors/:instructorId/courses/:courseId/stats',
  authenticate,
  authorize(['instructor', 'admin']),
  // cacheMiddleware(
  //   120,
  //   req =>
  //     RESPONSE_CACHE_KEYS.courseService.getCourseAnalytics(
  //       req.params.courseId?.[0]!,
  //       req.query.year as string
  //     ),

  //   req => [`course:${req.params.courseId}`, `instructor:${req.user!.userId}`]
  // ),
  asyncHandler(userController.getInstructorCourseAnalytics.bind(userController))
);



router.get(
  '/:userId',
  // cacheMiddleware(
  //   120,
  //   req => RESPONSE_CACHE_KEYS.userService.getUserById(req.params.userId),
  //   req => [`user:${req.params.userId}`]
  // ),
  asyncHandler(userController.getUser.bind(userController))
);

router.patch(
  '/:userId',
  authenticate,
  blocklistMiddleware,
  invalidateCacheMiddleware(req => [`user:${req.params.userId}`, 'users:list']),
  asyncHandler(userController.updateUserData.bind(userController))
);


//   '/:userId/block',
//   authenticate,
//   // blocklistMiddleware,
//   asyncHandler(userController.blockUser.bind(userController))
// );
// router.patch(
//   '/:userId/unblock',
//   authenticate,
//   // blocklistMiddleware,
//   asyncHandler(userController.unBlockUser.bind(userController))
// );

export { router as userRoutesV1 };
