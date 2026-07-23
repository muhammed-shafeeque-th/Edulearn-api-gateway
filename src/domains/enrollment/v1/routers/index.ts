import { Router } from 'express';
import { asyncHandler } from '@/shared/utils/async-handler';
import { EnrollmentController } from '../controllers';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { enrollmentEndpoints } from './route.constants';

const router = Router();
const enrollmentController = container.get<EnrollmentController>(
  TYPES.EnrollmentController
);

// ============================================================================
//                            ENROLLMENT ROUTES
// ============================================================================

router.get(
  enrollmentEndpoints.base,
  asyncHandler(enrollmentController.getEnrollments.bind(enrollmentController))
);

router.get(
  enrollmentEndpoints.certificateMe,
  asyncHandler(
    enrollmentController.getCertificatesByUser.bind(enrollmentController)
  )
);

router.get(
  enrollmentEndpoints.certificate,
  asyncHandler(enrollmentController.getCertificate.bind(enrollmentController))
);
router.get(
  enrollmentEndpoints.certificateDownload,
  asyncHandler(
    enrollmentController.downloadCertificate.bind(enrollmentController)
  )
);

router.get(
  enrollmentEndpoints.enrollment,
  asyncHandler(enrollmentController.getEnrollment.bind(enrollmentController))
);

router.get(
  enrollmentEndpoints.enrollmentCheck,
  asyncHandler(enrollmentController.checkEnrollment.bind(enrollmentController))
);

router.get(
  enrollmentEndpoints.enrollmentProgress,
  asyncHandler(
    enrollmentController.getProgressByEnrollment.bind(enrollmentController)
  )
);

router.post(
  enrollmentEndpoints.lessonProgress,
  asyncHandler(
    enrollmentController.updateLessonProgress.bind(enrollmentController)
  )
);
router.get(
  enrollmentEndpoints.enrollmentReview,
  asyncHandler(
    enrollmentController.getEnrollmentReview.bind(enrollmentController)
  )
);
router.post(
  enrollmentEndpoints.enrollmentReview,
  asyncHandler(
    enrollmentController.submitCourseReview.bind(enrollmentController)
  )
);

router.patch(
  enrollmentEndpoints.review,
  asyncHandler(
    enrollmentController.updateEnrollmentReview.bind(enrollmentController)
  )
);
router.delete(
  enrollmentEndpoints.enrollmentReview,
  asyncHandler(
    enrollmentController.deleteEnrollmentReview.bind(enrollmentController)
  )
);

router.post(
  enrollmentEndpoints.quizAttempt,
  asyncHandler(
    enrollmentController.submitQuizProgress.bind(enrollmentController)
  )
);
router.get(
  enrollmentEndpoints.playbackUrl,
  asyncHandler(
    enrollmentController.getSignedVideoPlaybackUrl.bind(enrollmentController)
  )
);
router.get(
  enrollmentEndpoints.playbackRefreshUrl,
  asyncHandler(
    enrollmentController.getSignedVideoPlaybackUrl.bind(enrollmentController)
  )
);

// Certificates
router.get(
  enrollmentEndpoints.enrollmentCertificate,
  asyncHandler(
    enrollmentController.getCertificateByEnrolment.bind(enrollmentController)
  )
);
router.post(
  enrollmentEndpoints.enrollmentCertificate,
  asyncHandler(
    enrollmentController.generateCertificate.bind(enrollmentController)
  )
);

export { router as enrollmentRouterV1 };
