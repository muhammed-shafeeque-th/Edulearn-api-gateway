import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CourseController } from '../../controllers/v1/course.controller';
import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
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
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.getCourseAnalytics.bind(courseController))
);
router.get(
  '/stats',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
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
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.updateCourse.bind(courseController))
);

router.post(
  '/',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.createCourse.bind(courseController))
);

router.delete(
  '/:courseId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.deleteCourse.bind(courseController))
);

router.patch(
  '/:courseId/publish',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.publishCourse.bind(courseController))
);
router.patch(
  '/:courseId/unpublish',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
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
//                               SECTION ROUTES
//  ============================================================================

router.post(
  '/:courseId/sections/:sectionId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.getSection.bind(courseController))
);

router.get(
  '/:courseId/sections/',
  asyncHandler(courseController.getSectionsByCourse.bind(courseController))
);

router.post(
  '/:courseId/sections/',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.createSection.bind(courseController))
);

router.patch(
  '/:courseId/sections/:sectionId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.updateSection.bind(courseController))
);

router.delete(
  '/:courseId/sections/:sectionId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.deleteSection.bind(courseController))
);

//  ============================================================================
//                               LESSON ROUTES
//  ============================================================================

router.get(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  asyncHandler(courseController.getLesson.bind(courseController))
);

router.get(
  '/:courseId/sections/:sectionId/lessons',
  asyncHandler(courseController.getLessonsBySection.bind(courseController))
);

router.post(
  '/:courseId/sections/:sectionId/lessons',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.createLesson.bind(courseController))
);

router.patch(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.updateLesson.bind(courseController))
);

router.delete(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.deleteLesson.bind(courseController))
);

//  ============================================================================
//                               QUIZ ROUTES
//  ============================================================================

router.get(
  '/:courseId/sections/:sectionId/quizzes',
  asyncHandler(courseController.getQuizzesByCourse.bind(courseController))
);

router.get(
  '/:courseId/sections/:sectionId/quizzes/:quizId',
  asyncHandler(courseController.getQuiz.bind(courseController))
);

router.post(
  '/:courseId/sections/:sectionId/quizzes',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.createQuiz.bind(courseController))
);

router.delete(
  '/:courseId/sections/:sectionId/quizzes/:quizId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.deleteQuiz.bind(courseController))
);

router.patch(
  '/:courseId/sections/:sectionId/quizzes/:quizId',
  authenticate,
  blocklistMiddleware,
  authorize(['instructor', 'admin']),
  asyncHandler(courseController.updateQuiz.bind(courseController))
);

export { router as courseRoutesV1 };
