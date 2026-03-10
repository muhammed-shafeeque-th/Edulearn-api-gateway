import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { config } from 'config';
import {
  CheckEnrollmentRequest,
  CheckEnrollmentResponse,
  CreateEnrollmentRequest,
  DeleteEnrollmentRequest,
  DeleteEnrollmentResponse,
  EnrollmentResponse,
  EnrollmentsResponse,
  GetEnrollmentDetailsResponse,
  GetEnrollmentRequest,
  GetEnrollmentResponse,
  GetEnrollmentsByCourseRequest,
  GetEnrollmentsByUserRequest,
  UpdateEnrollmentRequest,
} from '../course/proto/generated/course/types/enrollment';
import {
  CreateProgressRequest,
  DeleteProgressRequest,
  DeleteProgressResponse,
  EnrollmentProgressResponse,
  GetEnrollmentDetailsRequest,
  GetProgressByEnrollmentRequest,
  GetProgressRequest,
  ProgressResponse,
  ProgressesResponse,
  SubmitQuizAttemptRequest,
  SubmitQuizAttemptResponse,
  UpdateLessonProgressRequest,
  UpdateLessonProgressResponse,
} from '../course/proto/generated/course/types/progress';
import {
  GetReviewRequest,
  DeleteReviewRequest,
  DeleteReviewResponse,
  ReviewsResponse,
  SubmitCourseReviewRequest,
  GetReviewsByCourseRequest,
  ReviewResponse,
  UpdateReviewRequest,
  GetReviewByEnrollmentRequest,
} from '../course/proto/generated/course/types/review';
import { EnrollmentServiceClient } from '../course/proto/generated/course_service';
import { credentials } from '@grpc/grpc-js';
import { readFileSync } from 'fs';
import {
  CertificatePDFChunk,
  CertificateResponse,
  CertificatesResponse,
  DownloadCertificateRequest,
  GenerateCertificateRequest,
  GetCertificateByEnrollmentRequest,
  GetCertificateRequest,
  GetCertificatesByUserRequest,
} from '../course/proto/generated/course/types/certificate';
import {
  GetEnrollmentTrendRequest,
  GetEnrollmentTrendResponse,
  GetInstructorCourseEnrollmentSummeryRequest,
  GetInstructorCourseEnrollmentSummeryResponse,
  GetInstructorCourseEnrollmentTrendRequest,
  GetInstructorCourseEnrollmentTrendResponse,
  GetInstructorCoursesEnrollmentSummeryRequest,
  GetInstructorCoursesEnrollmentSummeryResponse,
  GetMonthlyCoursesEnrollmentStatsRequest,
  GetMonthlyCoursesEnrollmentStatsResponse,
  GetRevenueStatsRequest,
  GetRevenueStatsResponse,
} from '../course/proto/generated/course/types/stats';

import { injectable } from 'inversify';

@injectable()
export class EnrollmentService {
  private readonly client: GrpcClient<EnrollmentServiceClient>;
  private static instance: EnrollmentService;

  public constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.courseService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'course',
        'course_service.proto'
      ),
      packageName: 'course_service',
      serviceName: 'EnrollmentService',
      // // To use mTLS/SSL credentials, import grpc and configure certificates like so:
      // // Make sure to import 'grpc' at the top:
      // // import * as grpc from '@grpc/grpc-js';
      // credentials: credentials.createSsl(
      //   readFileSync(path.join(__dirname, 'certs', 'ca.crt')), // Root CA cert
      //   readFileSync(path.join(__dirname, 'certs', 'client.key')), // Client private key
      //   readFileSync(path.join(__dirname, 'certs', 'client.crt')) // Client cert chain
      // ),
      host,
      port: parseInt(port),
      loaderOptions: {
        includeDirs: [path.join(process.cwd(), 'proto', 'course')],
      },
    });
  }

  // Singleton pattern
  public static getInstance(): EnrollmentService {
    if (!EnrollmentService.instance) {
      EnrollmentService.instance = new EnrollmentService();
    }
    return EnrollmentService.instance;
  }

  // async createEnrollment(
  //   request: CreateEnrollmentRequest,
  //   options: GrpcClientOptions = {}
  // ): Promise<EnrollmentResponse> {
  //   const response = await this.client.unaryCall(
  //     'createEnrollment',
  //     request,
  //     options
  //   );
  //   return response as EnrollmentResponse;
  // }
  async getEnrollment(
    request: GetEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetEnrollmentResponse> {
    const response = await this.client.unaryCall(
      'getEnrollment',
      request,
      options
    );
    return response as GetEnrollmentResponse;
  }
  async getEnrollmentDetails(
    request: GetEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetEnrollmentDetailsResponse> {
    const response = await this.client.unaryCall(
      'getEnrollmentDetails',
      request,
      options
    );
    return response as GetEnrollmentDetailsResponse;
  }
  async updateEnrollment(
    request: UpdateEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<EnrollmentResponse> {
    const response = await this.client.unaryCall(
      'updateEnrollment',
      request,
      options
    );
    return response as EnrollmentResponse;
  }
  async deleteEnrollment(
    request: DeleteEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteEnrollmentResponse> {
    const response = await this.client.unaryCall(
      'deleteEnrollment',
      request,
      options
    );
    return response as DeleteEnrollmentResponse;
  }
  async getEnrollmentsByUser(
    request: GetEnrollmentsByUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<EnrollmentsResponse> {
    const response = await this.client.unaryCall(
      'getEnrollmentsByUser',
      request,
      options
    );
    return response as EnrollmentsResponse;
  }
  async getEnrollmentsByCourse(
    request: GetEnrollmentsByCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<EnrollmentsResponse> {
    const response = await this.client.unaryCall(
      'getEnrollmentsByCourse',
      request,
      options
    );
    return response as EnrollmentsResponse;
  }

  async createProgress(
    request: CreateProgressRequest,
    options: GrpcClientOptions = {}
  ): Promise<ProgressResponse> {
    const response = await this.client.unaryCall(
      'createProgress',
      request,
      options
    );
    return response as ProgressResponse;
  }
  async getProgress(
    request: GetProgressRequest,
    options: GrpcClientOptions = {}
  ): Promise<ProgressResponse> {
    const response = await this.client.unaryCall(
      'getProgress',
      request,
      options
    );
    return response as ProgressResponse;
  }
  async getProgressByEnrollment(
    request: GetProgressByEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<EnrollmentProgressResponse> {
    const response = await this.client.unaryCall(
      'getProgressByEnrollment',
      request,
      options
    );
    return response as EnrollmentProgressResponse;
  }
  async submitQuizProgress(
    request: SubmitQuizAttemptRequest,
    options: GrpcClientOptions = {}
  ): Promise<SubmitQuizAttemptResponse> {
    const response = await this.client.unaryCall(
      'submitQuizProgress',
      request,
      options
    );
    return response as SubmitQuizAttemptResponse;
  }
  async updateLessonProgress(
    request: UpdateLessonProgressRequest,
    options: GrpcClientOptions = {}
  ): Promise<UpdateLessonProgressResponse> {
    const response = await this.client.unaryCall(
      'updateLessonProgress',
      request,
      options
    );
    return response as UpdateLessonProgressResponse;
  }
  async deleteProgress(
    request: DeleteProgressRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteProgressResponse> {
    const response = await this.client.unaryCall(
      'deleteProgress',
      request,
      options
    );
    return response as DeleteProgressResponse;
  }

  async submitCourseReview(
    request: SubmitCourseReviewRequest,
    options: GrpcClientOptions = {}
  ): Promise<ReviewResponse> {
    const response = await this.client.unaryCall(
      'submitCourseReview',
      request,
      options
    );
    return response as ReviewResponse;
  }
  async getReview(
    request: GetReviewRequest,
    options: GrpcClientOptions = {}
  ): Promise<ReviewResponse> {
    const response = await this.client.unaryCall('getReview', request, options);
    return response as ReviewResponse;
  }
  async updateReview(
    request: UpdateReviewRequest,
    options: GrpcClientOptions = {}
  ): Promise<ReviewResponse> {
    const response = await this.client.unaryCall(
      'updateReview',
      request,
      options
    );
    return response as ReviewResponse;
  }
  async deleteReview(
    request: DeleteReviewRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteReviewResponse> {
    const response = await this.client.unaryCall(
      'deleteReview',
      request,
      options
    );
    return response as DeleteReviewResponse;
  }
  async getReviewsByCourse(
    request: GetReviewsByCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<ReviewsResponse> {
    const response = await this.client.unaryCall(
      'getReviewsByCourse',
      request,
      options
    );
    return response as ReviewsResponse;
  }
  async getReviewByEnrollment(
    request: GetReviewByEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<ReviewResponse> {
    const response = await this.client.unaryCall(
      'getReviewByEnrollment',
      request,
      options
    );
    return response as ReviewResponse;
  }

  async checkEnrolled(
    request: CheckEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<CheckEnrollmentResponse> {
    const response = await this.client.unaryCall(
      'checkEnrollment',
      request,
      options
    );
    return response as CheckEnrollmentResponse;
  }

  async getCertificate(
    request: GetCertificateRequest,
    options: GrpcClientOptions = {}
  ): Promise<CertificateResponse> {
    const response = await this.client.unaryCall(
      'getCertificate',
      request,
      options
    );
    return response as CertificateResponse;
  }
  async getCertificateByEnrollment(
    request: GetCertificateByEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<CertificateResponse> {
    const response = await this.client.unaryCall(
      'getCertificateByEnrollment',
      request,
      options
    );
    return response as CertificateResponse;
  }

  async getCertificatesByUser(
    request: GetCertificatesByUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<CertificatesResponse> {
    const response = await this.client.unaryCall(
      'getCertificatesByUser',
      request,
      options
    );
    return response as CertificatesResponse;
  }

  async downloadCertificate(
    request: DownloadCertificateRequest,
    options: GrpcClientOptions = {}
  ) {
    const response = await this.client.streamEventCall<
      DownloadCertificateRequest,
      CertificatePDFChunk
    >('downloadCertificate', request, options);

    return response;
  }

  async generateCertificate(
    request: GenerateCertificateRequest,
    options: GrpcClientOptions = {}
  ): Promise<CertificateResponse> {
    const response = await this.client.unaryCall(
      'generateCertificate',
      request,
      options
    );
    return response as CertificateResponse;
  }

  // Stats
  async getInstructorCoursesEnrollmentSummery(
    request: GetInstructorCoursesEnrollmentSummeryRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorCoursesEnrollmentSummeryResponse> {
    const response = await this.client.unaryCall(
      'getInstructorCoursesEnrollmentSummery',
      request,
      options
    );
    return response as GetInstructorCoursesEnrollmentSummeryResponse;
  }

  async getInstructorCourseEnrollmentSummery(
    request: GetInstructorCourseEnrollmentSummeryRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorCourseEnrollmentSummeryResponse> {
    const response = await this.client.unaryCall(
      'getInstructorCourseEnrollmentSummery',
      request,
      options
    );
    return response as GetInstructorCourseEnrollmentSummeryResponse;
  }

  async getInstructorCourseEnrollmentTrend(
    request: GetInstructorCourseEnrollmentTrendRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorCourseEnrollmentTrendResponse> {
    const response = await this.client.unaryCall(
      'getInstructorCourseEnrollmentTrend',
      request,
      options
    );
    return response as GetInstructorCourseEnrollmentTrendResponse;
  }
  async getEnrollmentTrend(
    request: GetEnrollmentTrendRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetEnrollmentTrendResponse> {
    const response = await this.client.unaryCall(
      'getEnrollmentTrend',
      request,
      options
    );
    return response as GetEnrollmentTrendResponse;
  }

  async getRevenueStats(
    request: GetRevenueStatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetRevenueStatsResponse> {
    const response = await this.client.unaryCall(
      'getRevenueStats',
      request,
      options
    );
    return response as GetRevenueStatsResponse;
  }

  async getMonthlyCoursesEnrollmentStats(
    request: GetMonthlyCoursesEnrollmentStatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetMonthlyCoursesEnrollmentStatsResponse> {
    const response = await this.client.unaryCall(
      'getMonthlyCoursesEnrollmentStats',
      request,
      options
    );
    return response as GetMonthlyCoursesEnrollmentStatsResponse;
  }

  close() {
    this.client.close();
  }
}
