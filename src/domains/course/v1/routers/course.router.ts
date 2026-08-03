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
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { courseEndpoints } from './route.constants';

const router = Router();

const courseController = container.get<CourseController>(
  TYPES.CourseController
);

//  ============================================================================
//                               COURSE ROUTES
//  ============================================================================

router.get(
  courseEndpoints.base,
  asyncHandler(courseController.getCourses.bind(courseController))
);

router.get(
  courseEndpoints.instructor,
  asyncHandler(courseController.getCoursesByInstructor.bind(courseController))
);

router.get(
  courseEndpoints.course,
  asyncHandler(courseController.getCourse.bind(courseController))
);
router.get(
  courseEndpoints.analytics,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.ANALYTICS_VIEW],
  }),
  asyncHandler(courseController.getCourseAnalytics.bind(courseController))
);
router.get(
  courseEndpoints.stats,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.ANALYTICS_VIEW],
  }),
  asyncHandler(courseController.getCoursesStats.bind(courseController))
);

router.get(
  courseEndpoints.reviews,
  asyncHandler(courseController.getReviewsByCourse.bind(courseController))
);

router.get(
  courseEndpoints.slug,
  asyncHandler(courseController.getCourseBySlug.bind(courseController))
);

router.patch(
  courseEndpoints.course,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateCourse.bind(courseController))
);

router.post(
  courseEndpoints.base,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createCourse.bind(courseController))
);

router.delete(
  courseEndpoints.course,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_DELETE_OWN],
  }),
  asyncHandler(courseController.deleteCourse.bind(courseController))
);

router.patch(
  courseEndpoints.publish,
  authGuard({
    roles: ['admin', 'instructor'],
    // permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.publishCourse.bind(courseController))
);
router.patch(
  courseEndpoints.unpublish,
  authGuard({
    roles: ['admin', 'instructor'],
    // permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.unPublishCourse.bind(courseController))
);

// router.get(
//   courseEndpoints.related,
//   authenticate,
//   asyncHandler(courseController.relatedCourses.bind(courseController))
// );

// router.post(
//   courseEndpoints.enroll,
//   authenticate,
//   asyncHandler(courseController.enrollInCourse.bind(courseController))
// );

// router.get(
//   courseEndpoints.featured,
//   authenticate,
//   asyncHandler(courseController.getFeaturedCourses.bind(courseController))
// );

//  ============================================================================
//                               MODULE ROUTES
//  ============================================================================

router.post(
  courseEndpoints.module,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.getModule.bind(courseController))
);

router.get(
  courseEndpoints.modules,
  asyncHandler(courseController.getModulesByCourse.bind(courseController))
);

router.post(
  courseEndpoints.modules,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createModule.bind(courseController))
);

router.patch(
  courseEndpoints.module,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateModule.bind(courseController))
);

router.delete(
  courseEndpoints.module,
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
  courseEndpoints.lesson,
  asyncHandler(courseController.getLesson.bind(courseController))
);

router.get(
  courseEndpoints.lessons,
  asyncHandler(courseController.getLessonsByModule.bind(courseController))
);

router.post(
  courseEndpoints.lessons,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createLesson.bind(courseController))
);

router.patch(
  courseEndpoints.lesson,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateLesson.bind(courseController))
);

router.delete(
  courseEndpoints.lesson,
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
  courseEndpoints.quizzes,
  asyncHandler(courseController.getQuizzesByCourse.bind(courseController))
);

router.get(
  courseEndpoints.quiz,
  asyncHandler(courseController.getQuiz.bind(courseController))
);

router.post(
  courseEndpoints.quizzes,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.createQuiz.bind(courseController))
);

router.delete(
  courseEndpoints.quiz,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.deleteQuiz.bind(courseController))
);

router.patch(
  courseEndpoints.quiz,
  authGuard({
    roles: ['admin', 'instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(courseController.updateQuiz.bind(courseController))
);

export { router as courseRouter };
