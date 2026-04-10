import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CourseController } from '../controllers/course.controller';
import { Router } from 'express';
import {
  authenticate,
  authorize,
  authGuard,
} from '@/middlewares/auth.middleware';
import { Permissions } from '@/shared/types';
import { container, TYPES } from '@/services/di';

const router = Router();

const courseController = container.get<CourseController>(
  TYPES.CourseController
);

//  ============================================================================
//                               COURSE ROUTES
//  ============================================================================

router.get(
  '/',
  asyncHandler(courseController.getCourses.bind(courseController))
);

router.get(
  '/instructor/:instructorId',
  asyncHandler(courseController.getCoursesByInstructor.bind(courseController))
);

router.get(
  '/:courseId',
  asyncHandler(courseController.getCourse.bind(courseController))
);
router.get(
  '/:courseId/analytics',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.ANALYTICS_VIEW],
  }),
  asyncHandler(courseController.getCourseAnalytics.bind(courseController))
);
router.get(
  '/stats',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.ANALYTICS_VIEW],
  }),
  asyncHandler(courseController.getCoursesStats.bind(courseController))
);

router.get(
  '/:courseId/reviews',
  asyncHandler(courseController.getReviewsByCourse.bind(courseController))
);

router.get(
  '/slug/:slug',
  asyncHandler(courseController.getCourseBySlug.bind(courseController))
);

router.patch(
  '/:courseId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateCourse.bind(courseController))
);

router.post(
  '/',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createCourse.bind(courseController))
);

router.delete(
  '/:courseId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_DELETE_OWN],
  }),
  asyncHandler(courseController.deleteCourse.bind(courseController))
);

router.patch(
  '/:courseId/publish',
  authGuard({
    roles: ['admin', 'instructor'],
    // permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.publishCourse.bind(courseController))
);
router.patch(
  '/:courseId/unpublish',
  authGuard({
    roles: ['admin', 'instructor'],
    // permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.unPublishCourse.bind(courseController))
);

// router.get(
//   '/:courseId/related',
//   authenticate,
//   asyncHandler(courseController.relatedCourses.bind(courseController))
// );

// router.post(
//   '/:courseId/enroll',
//   authenticate,
//   asyncHandler(courseController.enrollInCourse.bind(courseController))
// );

// router.get(
//   '/featured',
//   authenticate,
//   asyncHandler(courseController.getFeaturedCourses.bind(courseController))
// );

//  ============================================================================
//                               MODULE ROUTES
//  ============================================================================

router.post(
  '/:courseId/modules/:moduleId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.getModule.bind(courseController))
);

router.get(
  '/:courseId/modules/',
  asyncHandler(courseController.getModulesByCourse.bind(courseController))
);

router.post(
  '/:courseId/modules/',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createModule.bind(courseController))
);

router.patch(
  '/:courseId/modules/:moduleId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateModule.bind(courseController))
);

router.delete(
  '/:courseId/modules/:moduleId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.deleteModule.bind(courseController))
);

//  ============================================================================
//                               LESSON ROUTES
//  ============================================================================

router.get(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  asyncHandler(courseController.getLesson.bind(courseController))
);

router.get(
  '/:courseId/modules/:moduleId/lessons',
  asyncHandler(courseController.getLessonsByModule.bind(courseController))
);

router.post(
  '/:courseId/modules/:moduleId/lessons',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createLesson.bind(courseController))
);

router.patch(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateLesson.bind(courseController))
);

router.delete(
  '/:courseId/modules/:moduleId/lessons/:lessonId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.deleteLesson.bind(courseController))
);

//  ============================================================================
//                               QUIZ ROUTES
//  ============================================================================

router.get(
  '/:courseId/modules/:moduleId/quizzes',
  asyncHandler(courseController.getQuizzesByCourse.bind(courseController))
);

router.get(
  '/:courseId/modules/:moduleId/quizzes/:quizId',
  asyncHandler(courseController.getQuiz.bind(courseController))
);

router.post(
  '/:courseId/modules/:moduleId/quizzes',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createQuiz.bind(courseController))
);

router.delete(
  '/:courseId/modules/:moduleId/quizzes/:quizId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.deleteQuiz.bind(courseController))
);

router.patch(
  '/:courseId/modules/:moduleId/quizzes/:quizId',
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateQuiz.bind(courseController))
);

export { router as courseRouter };
