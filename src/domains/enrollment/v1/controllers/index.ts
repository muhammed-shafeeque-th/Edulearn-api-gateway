import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/security/validate-schema';

import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { attachMetadata } from '../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { getEnrollmentByUserSchema } from '../schemas/enrollment/get-enrollments-by-user.schema';
import { getReviewsByCourseSchema } from '../schemas/review/get-reviews-by-courseId.schema';
import { getReviewByEnrollmentSchema } from '../schemas/review/get-review.schema';
import { submitReviewSchema } from '../schemas/review/submit-review.schema';
import { deleteReviewSchema } from '../schemas/review/delete-review.schema';
import { updateReviewSchema } from '../schemas/review/update-review.schema';
import { getEnrollmentSchema } from '../schemas/enrollment/get-enrollment.schema';
import { deleteEnrollmentSchema } from '../schemas/enrollment/delete-enrollment.schema';
import { updateEnrollmentSchema } from '../schemas/enrollment/update-enrollment.schema';
import { getProgressSchema } from '../schemas/progress/get-progress.schema';
import { getProgressByEnrollmentSchema } from '../schemas/progress/get-progress-by-enrollment.schema';
import { updateLessonProgressSchema } from '../schemas/progress/update-lesson-progress.schema';
import { submitQuizProgressSchema } from '../schemas/progress/submit-quiz-progress.schema';
import { deleteProgressSchema } from '../schemas/progress/delete-enrollment.schema';
import { checkEnrollmentSchema } from '../schemas/enrollment/check-enrollment.schema';
import {
  EnrollmentProgressData,
  ProgressData,
} from '@/domains/service-clients/course/proto/generated/course/types/progress';
import { ReviewData } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { videoPlaybackRefreshUrlSchema } from '../schemas/video-playback-refresh.schema';
import { videoPlaybackUrlSchema } from '../schemas/video-playback.schema';
import { AuthorizationError } from '@/shared/errors/unauthorize.error';
import {
  s3StorageService,
  S3StorageService,
} from '@/services/media/storage.service';
import { ENROLLMENT_MESSAGES } from '../utils/resposne-messages';
import {
  DomainEnrollmentDetail,
  Enrollment,
  QuestionOption,
  QuizQuestion,
} from '../types';
import {
  EnrollmentData,
  EnrollmentDetail,
} from '@/domains/service-clients/course/proto/generated/course/types/enrollment';
import { getCertificateSchema } from '../schemas/certificate/get-certificate.schema';
import { CertificateData } from '@/domains/service-clients/course/proto/generated/course/types/certificate';
import { getCertificateByEnrollmentSchema } from '../schemas/certificate/get-certificate-by-enrollment.schema';
import { generateCertificateSchema } from '../schemas/certificate/generate-certificate.schema';
import { getReviewSchema } from '../schemas/review/get-review-by-enrollment.schema';
import { getCertificatesByUserSchema } from '../schemas/certificate/get-certificates-by-user.schema';
import { downloadCertificateSchema } from '../schemas/certificate/download-certificate.schema';
import { HttpStatus } from '@/shared/constants/http-status';
import { EnrollmentResponseMapper } from '../utils/mappers';
import { EnrollmentService } from '@/domains/service-clients/enrollment';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/services/di';

@Observe({ logLevel: 'debug' })
@injectable()
export class EnrollmentController {
  private storageService: S3StorageService;
  constructor(
    @inject(TYPES.UserService) private userServiceClient: UserService,
    @inject(TYPES.CourseService) private courseService: CourseService,
    @inject(TYPES.EnrollmentService)
    private enrollmentServiceClient: EnrollmentService
  ) {
    this.storageService = s3StorageService;
  }

  // =================================================================================================================================
  //                                                    REVIEWS
  // =================================================================================================================================
  async getReviewsByCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { pagination: req.query, ...req.params },
      getReviewsByCourseSchema
    )!;

    const { reviews } = await this.enrollmentServiceClient.getReviewsByCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      reviews?.total
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_REVIEWS_BY_COURSE.statusCode)
      .success(
        reviews?.reviews.map(EnrollmentResponseMapper.toReview),
        ENROLLMENT_MESSAGES.GET_REVIEWS_BY_COURSE.message
      );
  }

  async getEnrollmentReview(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      getReviewByEnrollmentSchema
    )!;

    const { review } = await this.enrollmentServiceClient.getReviewByEnrollment(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_REVIEW.statusCode)
      .success(
        EnrollmentResponseMapper.toReview(review!),
        ENROLLMENT_MESSAGES.GET_REVIEW.message
      );
  }
  async getReview(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      getReviewSchema
    )!;

    const { review } = await this.enrollmentServiceClient.getReview(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_REVIEW.statusCode)
      .success(
        EnrollmentResponseMapper.toReview(review!),
        ENROLLMENT_MESSAGES.GET_REVIEW.message
      );
  }

  async submitCourseReview(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        userId: req.user?.userId,
        user: { id: req.user?.userId, name: req.user?.username, ...req.user },
      },
      submitReviewSchema
    )!;

    console.log('Submit quiz payload', JSON.stringify(validPayload, null, 2));

    const { review } = await this.enrollmentServiceClient.submitCourseReview(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.SUBMIT_COURSE_REVIEW.statusCode)
      .success(
        EnrollmentResponseMapper.toReview(review!),
        ENROLLMENT_MESSAGES.SUBMIT_COURSE_REVIEW.message
      );
  }

  async deleteEnrollmentReview(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      deleteReviewSchema
    )!;

    await this.enrollmentServiceClient.deleteReview(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.DELETE_REVIEW.statusCode)
      .success({});
  }

  async updateEnrollmentReview(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      updateReviewSchema
    )!;

    const { review } = await this.enrollmentServiceClient.updateReview(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.UPDATE_REVIEW.statusCode)
      .success(
        EnrollmentResponseMapper.toReview(review!),
        ENROLLMENT_MESSAGES.UPDATE_REVIEW.message
      );
  }

  // =================================================================================================================================
  //                                                    ENROLLMENTS
  // =================================================================================================================================

  async getEnrollment(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      getEnrollmentSchema
    )!;

    const { enrollment } =
      await this.enrollmentServiceClient.getEnrollmentDetails(validPayload, {
        metadata: attachMetadata(req),
      });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_ENROLLMENT.statusCode)
      .success(
        EnrollmentResponseMapper.toEnrollmentDetail(enrollment!),
        ENROLLMENT_MESSAGES.GET_ENROLLMENT.message
      );
  }

  async checkEnrollment(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      checkEnrollmentSchema
    )!;

    const { enrolled } = await this.enrollmentServiceClient.checkEnrolled(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.CHECK_ENROLLMENT.statusCode)
      .success({ enrolled }, ENROLLMENT_MESSAGES.CHECK_ENROLLMENT.message);
  }

  async getEnrollments(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        pagination: req.query,
        userId: req.user?.userId || req.query?.userId,
      },
      getEnrollmentByUserSchema
    )!;

    const { enrollments } =
      await this.enrollmentServiceClient.getEnrollmentsByUser(validPayload, {
        metadata: attachMetadata(req),
      });

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      enrollments?.total
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_USER_ENROLLMENTS.statusCode)
      .success(
        enrollments?.enrollments.map(EnrollmentResponseMapper.toEnrollmentData),
        ENROLLMENT_MESSAGES.GET_USER_ENROLLMENTS.message,
        paginationResponse
      );
  }

  async deleteEnrollment(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      deleteEnrollmentSchema
    )!;

    await this.enrollmentServiceClient.deleteEnrollment(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.DELETE_ENROLLMENT.statusCode)
      .success({});
  }

  async updateEnrollment(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      updateEnrollmentSchema
    )!;

    const { enrollment } = await this.enrollmentServiceClient.updateEnrollment(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.UPDATE_ENROLLMENT.statusCode)
      .success(
        EnrollmentResponseMapper.toEnrollmentData(enrollment!),
        ENROLLMENT_MESSAGES.UPDATE_ENROLLMENT.message
      );
  }

  // =================================================================================================================================
  //                                                    CERTIFICATE
  // =================================================================================================================================

  async downloadCertificate(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      downloadCertificateSchema
    )!;

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificate-${validPayload.certificateId}.pdf"`
    );

    const stream = await this.enrollmentServiceClient.downloadCertificate(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    stream.on('data', (chunk: { data: Buffer }) => {
      res.write(chunk.data);
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (error: Error) => {
      console.log('Stream error: ', error);
      if (!res.headersSent) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Failed to download certificate' });
      }
    });
  }

  async getCertificate(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      getCertificateSchema
    )!;

    const { certificate } = await this.enrollmentServiceClient.getCertificate(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_PROGRESS.statusCode)
      .success(
        EnrollmentResponseMapper.toCertificate(certificate!),
        ENROLLMENT_MESSAGES.GET_PROGRESS.message
      );
  }

  async getCertificateByEnrolment(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      getCertificateByEnrollmentSchema
    )!;

    const { certificate } =
      await this.enrollmentServiceClient.getCertificateByEnrollment(
        validPayload,
        {
          metadata: attachMetadata(req),
        }
      );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_PROGRESS.statusCode)
      .success(
        EnrollmentResponseMapper.toCertificate(certificate!),
        ENROLLMENT_MESSAGES.GET_PROGRESS.message
      );
  }

  async generateCertificate(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params, ...req.body },
      generateCertificateSchema
    )!;

    const { certificate } =
      await this.enrollmentServiceClient.generateCertificate(validPayload, {
        metadata: attachMetadata(req),
      });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_PROGRESS.statusCode)
      .success(
        EnrollmentResponseMapper.toCertificate(certificate!),
        ENROLLMENT_MESSAGES.GET_PROGRESS.message
      );
  }
  async getCertificatesByUser(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params, ...req.body },
      getCertificatesByUserSchema
    )!;

    const { certificates } =
      await this.enrollmentServiceClient.getCertificatesByUser(validPayload, {
        metadata: attachMetadata(req),
      });

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      certificates?.total
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_PROGRESS.statusCode)
      .success(
        certificates?.certificates.map(EnrollmentResponseMapper.toCertificate),
        ENROLLMENT_MESSAGES.GET_PROGRESS.message,
        paginationResponse
      );
  }

  // =================================================================================================================================
  //                                                    PROGRESS
  // =================================================================================================================================

  async getProgress(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getProgressSchema
    )!;

    const { progress } = await this.enrollmentServiceClient.getProgress(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_PROGRESS.statusCode)
      .success(
        EnrollmentResponseMapper.toProgress(progress!),
        ENROLLMENT_MESSAGES.GET_PROGRESS.message
      );
  }

  async getProgressByEnrollment(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.user, ...req.params },
      getProgressByEnrollmentSchema
    )!;

    const { progress } =
      await this.enrollmentServiceClient.getProgressByEnrollment(validPayload, {
        metadata: attachMetadata(req),
      });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_PROGRESS_BY_ENROLLMENT.statusCode)
      .success(
        EnrollmentResponseMapper.toEnrollmentProgress(progress!),
        ENROLLMENT_MESSAGES.GET_PROGRESS_BY_ENROLLMENT.message
      );
  }

  async updateLessonProgress(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.user, ...req.params },
      updateLessonProgressSchema
    )!;

    const { progress } =
      await this.enrollmentServiceClient.updateLessonProgress(validPayload, {
        metadata: attachMetadata(req),
      });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.UPDATE_LESSON_PROGRESS.statusCode)
      .success(progress, ENROLLMENT_MESSAGES.UPDATE_LESSON_PROGRESS.message);
  }

  async submitQuizProgress(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.user, ...req.params },
      submitQuizProgressSchema
    )!;

    const { progress } = await this.enrollmentServiceClient.submitQuizProgress(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.SUBMIT_QUIZ_PROGRESS.statusCode)
      .success(progress, ENROLLMENT_MESSAGES.SUBMIT_QUIZ_PROGRESS.message);
  }

  async deleteProgress(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      deleteProgressSchema
    )!;

    await this.enrollmentServiceClient.deleteProgress(validPayload, {
      metadata: attachMetadata(req),
      options: {
        deadline: Date.now() + 10000, // 10 seconds from now
      },
    });

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.DELETE_PROGRESS.statusCode)
      .success({});
  }

  // =================================================================================================================================
  //                                                    PLAYBACK URLS
  // =================================================================================================================================

  async getVideoPlaybackRefreshUrl(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, userId: req.user?.userId, ...req.params },
      videoPlaybackRefreshUrlSchema
    )!;

    // create metadata object to pass req headers

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_VIDEO_PLAYBACK_REFRESH_URL.statusCode)
      .success({});
  }

  async getSignedVideoPlaybackUrl(req: Request, res: Response) {
    const validPayload = validateSchema(
      { userId: req.user?.userId, ...req.params },
      videoPlaybackUrlSchema
    )!;

    const [{ enrolled }, { lesson }] = await Promise.all([
      this.enrollmentServiceClient.checkEnrolled(validPayload, {
        metadata: attachMetadata(req),
      }),
      this.courseService.getLesson({
        lessonId: validPayload.lessonId,
      }),
    ]);

    if (!enrolled) {
      throw new AuthorizationError(
        'You are not enrolled in this course and cannot access these course materials.'
      );
    }
    if (!lesson) {
      throw new Error(
        'Invalid lesson id: The requested lesson does not exist or you do not have access to it.'
      );
    }

    let urlResponse;
    const now = Date.now();

    if (lesson.isPreview) {
      urlResponse = {
        url: lesson.contentUrl,
        expiryAt: now + 3600 * 1000, //
        duration: lesson.estimatedDuration,
      };
    } else {
      const response = await this.storageService.getSignedSecureCourseUrl(
        lesson.contentUrl
      );
      urlResponse = {
        url: response.url,
        expiryAt: now + response.expiry * 1000,
        duration: lesson.estimatedDuration,
      };
    }

    return new ResponseWrapper(res)
      .status(ENROLLMENT_MESSAGES.GET_SIGNED_VIDEO_PLAYBACK_URL.statusCode)
      .success(
        urlResponse,
        ENROLLMENT_MESSAGES.GET_SIGNED_VIDEO_PLAYBACK_URL.message
      );
  }
}
