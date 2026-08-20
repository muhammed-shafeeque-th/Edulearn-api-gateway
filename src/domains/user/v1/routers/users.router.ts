import { asyncHandler } from '@/shared/utils/async-handler';
import { UserController } from '../controllers/user.controller';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { invalidateCacheMiddleware } from '@/middlewares/cache.invalidation.middleware';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { Permissions } from '@/shared/types';
import { userEndpoints } from './route.constants';

const router = Router();

const userController = container.get<UserController>(TYPES.UserController);

router.get(
  userEndpoints.base,
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.listUsers(req.query),
  //   () => ['users:list']
  // ),
  asyncHandler(userController.getUsers.bind(userController))
);

router.get(
  userEndpoints.stats,
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_MANAGE] }),
  // cacheMiddleware(
  //   300,
  //   () => RESPONSE_CACHE_KEYS.userService.getUsersStats(),
  //   () => ['users:stats']
  // ),
  asyncHandler(userController.getUsersStats.bind(userController))
);

router.get(
  userEndpoints.online,
  authGuard(),
  // cacheMiddleware(
  //   30,
  //   () => RESPONSE_CACHE_KEYS.userService.getOnlineUsers(),
  //   () => ['users:online']
  // ),
  asyncHandler(userController.getOnlineUsers.bind(userController))
);

router.get(
  userEndpoints.usernameCheck,
  asyncHandler(userController.checkUsername.bind(userController))
);

router.get(
  userEndpoints.me,
  authGuard(),
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.getUserById(req.user!.userId),
  //   req => [`user:${req.user!.userId}`]
  // ),
  asyncHandler(userController.getCurrentUser.bind(userController))
);

router.patch(
  userEndpoints.me,
  authGuard(),
  // invalidateCacheMiddleware(req => [
  //   `user:${req.user!.userId}`,
  //   'users:list',
  // ]),
  asyncHandler(userController.updateCurrentUser.bind(userController))
);

router.get(
  userEndpoints.myInstructors,
  authGuard(),
  asyncHandler(userController.listInstructorsOfStudent.bind(userController))
);

router.get(
  userEndpoints.myStudents,
  authGuard({ roles: ['instructor'] }),
  asyncHandler(userController.listStudentsOfInstructor.bind(userController))
);

router.get(
  userEndpoints.instructors,
  // cacheMiddleware(
  //   60,
  //   req => RESPONSE_CACHE_KEYS.userService.listInstructors(req.query),
  //   () => ['instructors:list']
  // ),
  asyncHandler(userController.listInstructors.bind(userController))
);

router.get(
  userEndpoints.instructorsStats,
  authGuard(),
  // cacheMiddleware(
  //   120,
  //   req => RESPONSE_CACHE_KEYS.userService.getInstructorsStats(),
  //   () => ['instructors:stats']
  // ),
  asyncHandler(userController.getInstructorsStats.bind(userController))
);

router.post(
  userEndpoints.changePassword,
  authGuard(),
  asyncHandler(userController.changePassword.bind(userController))
);

router.post(
  userEndpoints.instructorRegister,
  authGuard(),
  blocklistMiddleware,
  // invalidateCacheMiddleware(req => ['instructors:list', 'instructors:stats']),
  asyncHandler(userController.registerInstructor.bind(userController))
);

router.get(
  userEndpoints.instructorStats,
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
  userEndpoints.instructorCoursesStats,
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
  userEndpoints.instructorCourseStats,
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
  userEndpoints.user,
  // cacheMiddleware(
  //   120,
  //   req => RESPONSE_CACHE_KEYS.userService.getUserById(req.params.userId),
  //   req => [`user:${req.params.userId}`]
  // ),
  asyncHandler(userController.getUser.bind(userController))
);

router.patch(
  userEndpoints.user,
  authGuard(),
  blocklistMiddleware,
  invalidateCacheMiddleware(req => [`user:${req.params.userId}`, 'users:list']),
  asyncHandler(userController.updateUserData.bind(userController))
);

//   userEndpoints:userId/block',
//   authenticate,
//   // blocklistMiddleware,
//   asyncHandler(userController.blockUser.bind(userController))
// );
// router.patch(
//   userEndpoints:userId/unblock',
//   authenticate,
//   // blocklistMiddleware,
//   asyncHandler(userController.unBlockUser.bind(userController))
// );

export { router as userRouter };
