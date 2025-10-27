import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  CourseServiceClient,
  GetAllCoursesRequest,
  CoursesResponse,
  GetCourseRequest,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
  DeleteCourseRequest,
  DeleteCourseResponse,
  GetCoursesByInstructorRequest,
  GetEnrolledCoursesRequest,
  CreateLessonRequest,
  LessonResponse,
  GetLessonsBySectionRequest,
  LessonsResponse,
  UpdateLessonRequest,
  DeleteLessonRequest,
  SectionResponse,
  CreateSectionRequest,
  GetSectionRequest,
  UpdateSectionRequest,
  DeleteSectionResponse,
  DeleteSectionRequest,
  GetSectionsByCourseRequest,
  SectionsResponse,
  GetLessonRequest,
  QuizResponse,
  GetQuizRequest,
  CreateQuizRequest,
  UpdateQuizRequest,
  DeleteQuizRequest,
  DeleteQuizResponse,
  GetQuizzesByCourseRequest,
  QuizzesResponse,
  CreateEnrollmentRequest,
  EnrollmentResponse,
  GetEnrollmentRequest,
  UpdateEnrollmentRequest,
  DeleteEnrollmentRequest,
  DeleteEnrollmentResponse,
  GetEnrollmentsByUserRequest,
  EnrollmentsResponse,
  GetEnrollmentsByCourseRequest,
  CreateProgressRequest,
  ProgressResponse,
  GetProgressRequest,
  UpdateProgressRequest,
  DeleteProgressRequest,
  DeleteProgressResponse,
  GetProgressByEnrollmentRequest,
  ProgressesResponse,
  CreateReviewRequest,
  ReviewResponse,
  DeleteLessonResponse,
  DeleteReviewRequest,
  DeleteReviewResponse,
  ReviewsResponse,
  GetReviewsByCourseRequest,
  UpdateReviewRequest,
  GetReviewRequest,
  GetCourseBySlugRequest,
  GetCoursesByIdsRequest,
  GetCoursesByIdsResponse,
} from './proto/generated/course_service';
import { config } from 'config';

export class CourseService {
  private readonly client: GrpcClient<CourseServiceClient>;
  private static instance: CourseService;

  private constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.courseService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(__dirname, 'proto', 'course_service.proto'),
      packageName: 'course',
      serviceName: 'CourseService',
      host,
      port: parseInt(port),
    });
  }

  // Singleton pattern
  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async getAllCourse(
    request: GetAllCoursesRequest,
    options: GrpcClientOptions = {}
  ): Promise<CoursesResponse> {
    const response = await this.client.unaryCall(
      'getAllCourse',
      request,
      options
    );
    return response as CoursesResponse;
  }

  async getCourse(
    request: GetCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<CourseResponse> {
    const response = await this.client.unaryCall('getCourse', request, options);
    return response as CourseResponse;
  }

  async createCourse(
    request: CreateCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<CourseResponse> {
    const response = await this.client.unaryCall(
      'createCourse',
      request,
      options
    );
    return response as CourseResponse;
  }

  async updateCourse(
    request: UpdateCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<CourseResponse> {
    const response = await this.client.unaryCall(
      'updateCourse',
      request,
      options
    );
    return response as CourseResponse;
  }

  async deleteCourse(
    request: DeleteCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteCourseResponse> {
    const response = await this.client.unaryCall(
      'deleteCourse',
      request,
      options
    );
    return response as DeleteCourseResponse;
  }

  async getCoursesByInstructor(
    request: GetCoursesByInstructorRequest,
    options: GrpcClientOptions = {}
  ): Promise<CoursesResponse> {
    const response = await this.client.unaryCall(
      'getCoursesByInstructor',
      request,
      options
    );
    return response as CoursesResponse;
  }

  async getEnrolledCourses(
    request: GetEnrolledCoursesRequest,
    options: GrpcClientOptions = {}
  ): Promise<CoursesResponse> {
    const response = await this.client.unaryCall(
      'getEnrolledCourses',
      request,
      options
    );
    return response as CoursesResponse;
  }
  async getCoursesBySlug(
    request: GetCourseBySlugRequest,
    options: GrpcClientOptions = {}
  ): Promise<CourseResponse> {
    const response = await this.client.unaryCall(
      'getCourseBySlug',
      request,
      options
    );
    return response as CourseResponse;
  }
  async getCoursesByIds(
    request: GetCoursesByIdsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetCoursesByIdsResponse> {
    const response = await this.client.unaryCall(
      'getCoursesByIds',
      request,
      options
    );
    return response as GetCoursesByIdsResponse;
  }

  async createSection(
    request: CreateSectionRequest,
    options: GrpcClientOptions = {}
  ): Promise<SectionResponse> {
    const response = await this.client.unaryCall(
      'createSection',
      request,
      options
    );
    return response as SectionResponse;
  }
  async getSection(
    request: GetSectionRequest,
    options: GrpcClientOptions = {}
  ): Promise<SectionResponse> {
    const response = await this.client.unaryCall(
      'getSection',
      request,
      options
    );
    return response as SectionResponse;
  }
  async updateSection(
    request: UpdateSectionRequest,
    options: GrpcClientOptions = {}
  ): Promise<SectionResponse> {
    const response = await this.client.unaryCall(
      'updateSection',
      request,
      options
    );
    return response as SectionResponse;
  }
  async deleteSection(
    request: DeleteSectionRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteSectionResponse> {
    const response = await this.client.unaryCall(
      'deleteSection',
      request,
      options
    );
    return response as DeleteSectionResponse;
  }
  async getSectionsByCourse(
    request: GetSectionsByCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<SectionsResponse> {
    const response = await this.client.unaryCall(
      'getSectionsByCourse',
      request,
      options
    );
    return response as SectionsResponse;
  }

  async createLesson(
    request: CreateLessonRequest,
    options: GrpcClientOptions = {}
  ): Promise<LessonResponse> {
    const response = await this.client.unaryCall(
      'createLesson',
      request,
      options
    );
    return response as LessonResponse;
  }
  async getLessonsBySection(
    request: GetLessonsBySectionRequest,
    options: GrpcClientOptions = {}
  ): Promise<LessonsResponse> {
    const response = await this.client.unaryCall(
      'getLessonsBySection',
      request,
      options
    );
    return response as LessonsResponse;
  }
  async updateLesson(
    request: UpdateLessonRequest,
    options: GrpcClientOptions = {}
  ): Promise<LessonResponse> {
    const response = await this.client.unaryCall(
      'updateLesson',
      request,
      options
    );
    return response as LessonResponse;
  }
  async deleteLesson(
    request: DeleteLessonRequest,
    options: GrpcClientOptions = {}
  ): Promise<LessonResponse> {
    const response = await this.client.unaryCall(
      'deleteLesson',
      request,
      options
    );
    return response as DeleteLessonResponse;
  }
  async getLesson(
    request: GetLessonRequest,
    options: GrpcClientOptions = {}
  ): Promise<LessonResponse> {
    const response = await this.client.unaryCall('getLesson', request, options);
    return response as LessonResponse;
  }

  async createQuiz(
    request: CreateQuizRequest,
    options: GrpcClientOptions = {}
  ): Promise<QuizResponse> {
    const response = await this.client.unaryCall(
      'createQuiz',
      request,
      options
    );
    return response as QuizResponse;
  }
  async getQuiz(
    request: GetQuizRequest,
    options: GrpcClientOptions = {}
  ): Promise<QuizResponse> {
    const response = await this.client.unaryCall('getQuiz', request, options);
    return response as QuizResponse;
  }
  async updateQuiz(
    request: UpdateQuizRequest,
    options: GrpcClientOptions = {}
  ): Promise<QuizResponse> {
    const response = await this.client.unaryCall(
      'updateQuiz',
      request,
      options
    );
    return response as QuizResponse;
  }
  async deleteQuiz(
    request: DeleteQuizRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteQuizResponse> {
    const response = await this.client.unaryCall(
      'deleteQuiz',
      request,
      options
    );
    return response as DeleteQuizResponse;
  }
  async getQuizzesByCourse(
    request: GetQuizzesByCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<QuizzesResponse> {
    const response = await this.client.unaryCall(
      'getQuizzesByCourse',
      request,
      options
    );
    return response as QuizzesResponse;
  }

  async createEnrollment(
    request: CreateEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<EnrollmentResponse> {
    const response = await this.client.unaryCall(
      'createEnrollment',
      request,
      options
    );
    return response as EnrollmentResponse;
  }
  async getEnrollment(
    request: GetEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<EnrollmentResponse> {
    const response = await this.client.unaryCall(
      'getEnrollment',
      request,
      options
    );
    return response as EnrollmentResponse;
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
  async updateProgress(
    request: UpdateProgressRequest,
    options: GrpcClientOptions = {}
  ): Promise<ProgressResponse> {
    const response = await this.client.unaryCall(
      'updateProgress',
      request,
      options
    );
    return response as ProgressResponse;
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
  async getProgressByEnrollment(
    request: GetProgressByEnrollmentRequest,
    options: GrpcClientOptions = {}
  ): Promise<ProgressesResponse> {
    const response = await this.client.unaryCall(
      'getProgressByEnrollment',
      request,
      options
    );
    return response as ProgressesResponse;
  }

  async createReview(
    request: CreateReviewRequest,
    options: GrpcClientOptions = {}
  ): Promise<ReviewResponse> {
    const response = await this.client.unaryCall(
      'createReview',
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

  close() {
    this.client.close();
  }
}
