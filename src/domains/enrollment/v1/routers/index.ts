import { Router } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { EnrollmentController } from '../controllers';
import { container, TYPES } from '@/services/di';

const router = Router();
const enrollmentController = container.get<EnrollmentController>(
  TYPES.EnrollmentController
);

// ============================================================================
//                            ENROLLMENT ROUTES
// ============================================================================

router.get(
  '/',
  asyncHandler(enrollmentController.getEnrollments.bind(enrollmentController))
);


router.get(
  '/certificates/me',
  asyncHandler(
    enrollmentController.getCertificatesByUser.bind(enrollmentController)
  )
);

router.get(
  '/certificates/:certificateId',
  asyncHandler(enrollmentController.getCertificate.bind(enrollmentController))
);
router.get(
  '/certificates/:certificateId/download',
  asyncHandler(
    enrollmentController.downloadCertificate.bind(enrollmentController)
  )
);



router.get(
  '/:enrollmentId',
  asyncHandler(enrollmentController.getEnrollment.bind(enrollmentController))
);

router.get(
  '/:enrollmentId/check',
  asyncHandler(enrollmentController.checkEnrollment.bind(enrollmentController))
);

router.get(
  '/:enrollmentId/progress',
  asyncHandler(
    enrollmentController.getProgressByEnrollment.bind(enrollmentController)
  )
);

router.post(
  '/:enrollmentId/lessons/:lessonId/progress',
  asyncHandler(
    enrollmentController.updateLessonProgress.bind(enrollmentController)
  )
);
router.get(
  '/:enrollmentId/review',
  asyncHandler(
    enrollmentController.getEnrollmentReview.bind(enrollmentController)
  )
);
router.post(
  '/:enrollmentId/review',
  asyncHandler(
    enrollmentController.submitCourseReview.bind(enrollmentController)
  )
);

router.patch(
  '/:enrollmentId/review/:reviewId',
  asyncHandler(
    enrollmentController.updateEnrollmentReview.bind(enrollmentController)
  )
);
router.delete(
  '/:enrollmentId/review/:reviewId',
  asyncHandler(
    enrollmentController.deleteEnrollmentReview.bind(enrollmentController)
  )
);

router.post(
  '/:enrollmentId/quizzes/:quizId/attempt',
  asyncHandler(
    enrollmentController.submitQuizProgress.bind(enrollmentController)
  )
);
router.get(
  '/:enrollmentId/lessons/:lessonId/playback/url',
  asyncHandler(
    enrollmentController.getSignedVideoPlaybackUrl.bind(enrollmentController)
  )
);
router.get(
  '/:enrollmentId/lessons/:lessonId/playback/url/refresh',
  asyncHandler(
    enrollmentController.getSignedVideoPlaybackUrl.bind(enrollmentController)
  )
);

// Certificates
router.get(
  '/:enrollmentId/certificate',
  asyncHandler(
    enrollmentController.getCertificateByEnrolment.bind(enrollmentController)
  )
);
router.post(
  '/:enrollmentId/certificate',
  asyncHandler(
    enrollmentController.generateCertificate.bind(enrollmentController)
  )
);

export { router as enrollmentRouterV1 };
