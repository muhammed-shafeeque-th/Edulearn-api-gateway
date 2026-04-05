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
  GetLessonsByModuleRequest,
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
  GetModuleRequest,
  DeleteModuleRequest,
  DeleteModuleResponse,
  GetModulesByCourseRequest,
  ModuleResponse,
  ModulesResponse,
  UpdateModuleRequest,
  CreateModuleRequest,
} from './proto/generated/course/types/module';
import { CourseServiceClient } from './proto/generated/course_service';
import {
  GetCoursesStatsResponse,
  GetInstructorCourseRatingStatsRequest,
  GetInstructorCourseRatingStatsResponse,
  GetInstructorCoursesStatsRequest,
  GetInstructorCoursesStatsResponse,
} from './proto/generated/course/types/stats';
import { Empty } from './proto/generated/course/common';
import {
  CategoryResponse,
  CategoriesResponse,
  DeleteCategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
  GetAllCategoriesRequest,
  ToggleCategoryStatusRequest,
  GetCategoriesStatsRequest,
  GetCategoriesStatsResponse,
} from './proto/generated/course/types/category';

import { injectable } from 'inversify';

@injectable()
export class CourseService {
  private readonly client: GrpcClient<CourseServiceClient>;
  private static instance: CourseService;

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

  /**
   * @deprecated Use Dependency Injection
   */
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

  async createModule(
    request: CreateModuleRequest,
    options: GrpcClientOptions = {}
  ): Promise<ModuleResponse> {
    const response = await this.client.unaryCall(
      'createModule',
      request,
      options
    );
    return response as ModuleResponse;
  }
  async getModule(
    request: GetModuleRequest,
    options: GrpcClientOptions = {}
  ): Promise<ModuleResponse> {
    const response = await this.client.unaryCall(
      'getModule',
      request,
      options
    );
    return response as ModuleResponse;
  }
  async updateModule(
    request: UpdateModuleRequest,
    options: GrpcClientOptions = {}
  ): Promise<ModuleResponse> {
    const response = await this.client.unaryCall(
      'updateModule',
      request,
      options
    );
    return response as ModuleResponse;
  }
  async deleteModule(
    request: DeleteModuleRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteModuleResponse> {
    const response = await this.client.unaryCall(
      'deleteModule',
      request,
      options
    );
    return response as DeleteModuleResponse;
  }
  async getModulesByCourse(
    request: GetModulesByCourseRequest,
    options: GrpcClientOptions = {}
  ): Promise<ModulesResponse> {
    const response = await this.client.unaryCall(
      'getModulesByCourse',
      request,
      options
    );
    return response as ModulesResponse;
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
  async getLessonsByModule(
    request: GetLessonsByModuleRequest,
    options: GrpcClientOptions = {}
  ): Promise<LessonsResponse> {
    const response = await this.client.unaryCall(
      'getLessonsByModule',
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

  // ===========================================================================
  //                           CATEGORY METHODS
  // ===========================================================================

  async getAllCategories(
    request: GetAllCategoriesRequest,
    options: GrpcClientOptions = {}
  ): Promise<CategoriesResponse> {
    const response = await this.client.unaryCall(
      'getAllCategories',
      request,
      options
    );
    return response as CategoriesResponse;
  }

  async createCategory(
    request: CreateCategoryRequest,
    options: GrpcClientOptions = {}
  ): Promise<CategoryResponse> {
    const response = await this.client.unaryCall(
      'createCategory',
      request,
      options
    );
    return response as CategoryResponse;
  }

  async updateCategory(
    request: UpdateCategoryRequest,
    options: GrpcClientOptions = {}
  ): Promise<CategoryResponse> {
    const response = await this.client.unaryCall(
      'updateCategory',
      request,
      options
    );
    return response as CategoryResponse;
  }

  async deleteCategory(
    request: DeleteCategoryRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteCategoryResponse> {
    const response = await this.client.unaryCall(
      'deleteCategory',
      request,
      options
    );
    return response as DeleteCategoryResponse;
  }
  
  async getCategoriesStats(
    request: GetCategoriesStatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetCategoriesStatsResponse> {
    const response = await this.client.unaryCall(
      'getCategoriesStats',
      request,
      options
    );
    return response as GetCategoriesStatsResponse;
  }

  async toggleCategoryStatus(
    request: ToggleCategoryStatusRequest,
    options: GrpcClientOptions = {}
  ): Promise<CategoryResponse> {
    const response = await this.client.unaryCall(
      'toggleCategoryStatus',
      request,
      options
    );
    return response as CategoryResponse;
  }

  close() {
    this.client.close();
  }
}
