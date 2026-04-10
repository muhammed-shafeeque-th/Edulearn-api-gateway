import { asyncHandler } from '@/shared/utils/async-handler';
import { UserController } from '../controllers/user.controller';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { invalidateCacheMiddleware } from '@/middlewares/cache.invalidation.middleware';
import { container, TYPES } from '@/services/di';
import { Permissions } from '@/shared/types';

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
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_MANAGE] }),
  // cacheMiddleware(
  //   300,
  //   () => RESPONSE_CACHE_KEYS.userService.getUsersStats(),
  //   () => ['users:stats']
  // ),
  asyncHandler(userController.getUsersStats.bind(userController))
);

router.get(
  '/online',
  authGuard(),
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
  authGuard(),
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.getUserById(req.user!.userId),
  //   req => [`user:${req.user!.userId}`]
  // ),
  asyncHandler(userController.getCurrentUser.bind(userController))
);

router.patch(
  '/me',
  authGuard(),
  // invalidateCacheMiddleware(req => [
  //   `user:${req.user!.userId}`,
  //   'users:list',
  // ]),
  asyncHandler(userController.updateCurrentUser.bind(userController))
);

router.get(
  '/me/instructors',
  authGuard(),
  asyncHandler(userController.listInstructorsOfStudent.bind(userController))
);

router.get(
  '/me/students',
  authGuard({ roles: ['instructor'] }),
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
  authGuard(),
  // cacheMiddleware(
  //   120,
  //   req => RESPONSE_CACHE_KEYS.userService.getInstructorsStats(),
  //   () => ['instructors:stats']
  // ),
  asyncHandler(userController.getInstructorsStats.bind(userController))
);

router.post(
  '/instructors/register',
  authGuard(),
  blocklistMiddleware,
  // invalidateCacheMiddleware(req => ['instructors:list', 'instructors:stats']),
  asyncHandler(userController.registerInstructor.bind(userController))
);

router.get(
  '/instructors/:instructorId/stats',
  authGuard({ roles: ['instructor', 'admin'] }),
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
  authGuard({ roles: ['instructor', 'admin'] }),
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
  authGuard(),
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

export { router as userRouter };
