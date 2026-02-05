import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { config } from 'config';
import {
  CourseResponse,
  CoursesListResponse,
  CreateCourseRequest,
  DeleteCourseRequest,
  DeleteCourseResponse,
  GetCourseBySlugRequest,
  GetCourseRequest,
  GetCoursesByIdsRequest,
  GetCoursesByIdsResponse,
  GetCoursesByInstructorRequest,
  GetCoursesRequest,
  GetEnrolledCoursesRequest,
  PublishCourseRequest,
  UnPublishCourseRequest,
  UpdateCourseRequest,
} from './proto/generated/course/types/course';
import {
  CreateLessonRequest,
  DeleteLessonRequest,
  DeleteLessonResponse,
  GetLessonRequest,
  GetLessonsBySectionRequest,
  LessonResponse,
  LessonsResponse,
  UpdateLessonRequest,
} from './proto/generated/course/types/lesson';
import {
  GetQuizRequest,
  DeleteQuizRequest,
  DeleteQuizResponse,
  GetQuizzesByCourseRequest,
  QuizResponse,
  UpdateQuizRequest,
  QuizzesResponse,
  CreateQuizRequest,
} from './proto/generated/course/types/quiz';
import {
  GetSectionRequest,
  DeleteSectionRequest,
  DeleteSectionResponse,
  GetSectionsByCourseRequest,
  SectionResponse,
  SectionsResponse,
  UpdateSectionRequest,
  CreateSectionRequest,
} from './proto/generated/course/types/section';
import { CourseServiceClient } from './proto/generated/course_service';
import { GetCoursesStatsResponse, GetInstructorCourseRatingStatsRequest, GetInstructorCourseRatingStatsResponse, GetInstructorCoursesStatsRequest, GetInstructorCoursesStatsResponse } from './proto/generated/course/types/stats';
import { Empty } from './proto/generated/course/common';

export class CourseService {
  private readonly client: GrpcClient<CourseServiceClient>;
  private static instance: CourseService;

  private constructor() {
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
      serviceName: 'CourseService',
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
  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async listCourses(
    request: GetCoursesRequest,
    options: GrpcClientOptions = {}
  ): Promise<CoursesListResponse> {
    const response = await this.client.unaryCall(
      'getCourses',
      request,
      options
    );
    return response as CoursesListResponse;
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
  async publishCourse(
    request: PublishCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<CourseResponse> {
    const response = await this.client.unaryCall(
      'publishCourse',
      request,
      options
    );
    return response as CourseResponse;
  }

  async unPublishCourse(
    request: UnPublishCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<CourseResponse> {
    const response = await this.client.unaryCall(
      'unPublishCourse',
      request,
      options
    );
    return response as CourseResponse;
  }

  async getCoursesByInstructor(
    request: GetCoursesByInstructorRequest,
    options: GrpcClientOptions = {}
  ): Promise<CoursesListResponse> {
    const response = await this.client.unaryCall(
      'getCoursesByInstructor',
      request,
      options
    );
    return response as CoursesListResponse;
  }

  async getEnrolledCourses(
    request: GetEnrolledCoursesRequest,
    options: GrpcClientOptions = {}
  ): Promise<CoursesListResponse> {
    const response = await this.client.unaryCall(
      'getEnrolledCourses',
      request,
      options
    );
    return response as CoursesListResponse;
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
  
  // Stats
  async getInstructorCoursesStats(
    request: GetInstructorCoursesStatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorCoursesStatsResponse> {
    const response = await this.client.unaryCall(
      'getInstructorCoursesStats',
      request,
      options
    );
    return response as GetInstructorCoursesStatsResponse;
  }
  async getCoursesStats(
    request: Empty,
    options: GrpcClientOptions = {}
  ): Promise<GetCoursesStatsResponse> {
    const response = await this.client.unaryCall(
      'getCoursesStats',
      request,
      options
    );
    return response as GetCoursesStatsResponse;
  }
  
  async getInstructorCourseRatingStats(
    request: GetInstructorCourseRatingStatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorCourseRatingStatsResponse> {
    const response = await this.client.unaryCall(
      'getInstructorCourseRatingStats',
      request,
      options
    );
    return response as GetInstructorCourseRatingStatsResponse;
  }

  close() {
    this.client.close();
  }
}
