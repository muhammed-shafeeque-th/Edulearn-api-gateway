import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { createCourseSchema } from '../../schemas/course/create-course.schema';
import { updateCourseSchema } from '../../schemas/course/update-current-course.schema';
import { getLessonSchema } from '../../schemas/lesson/get-lesson.schema';
import { deleteSectionSchema } from '../../schemas/section/delete-section.schema';
import { updateSectionSchema } from '../../schemas/section/update-section.schema';
import { getCourseByInstructorSchema } from '../../schemas/course/get-course-by-instructor.schema';
import { getCourseSchema } from '../../schemas/course/get-course.schema';
import { getCoursesSchema } from '../../schemas/course/get-courses.schema';
import { getEnrolledCoursesSchema } from '../../schemas/course/get-enrolled-courses.schema';
import { getSectionSchema } from '../../schemas/section/get-section.schema';
import { getSectionsByCourseSchema } from '../../schemas/section/get-section-by-courseId.schema';
import { createLessonSchema } from '../../schemas/lesson/create-lesson.schema';
import { deleteLessonSchema } from '../../schemas/lesson/delete-lesson.schema';
import { updateLessonSchema } from '../../schemas/lesson/update-lesson.schema';
import { getLessonsBySectionSchema } from '../../schemas/lesson/get-lessons-by-section.schema';
import { getQuizzesByCourseSchema } from '../../schemas/quiz/get-quiz-by-courseId.schema';
import { getQuizSchema } from '../../schemas/quiz/get-quiz.schema';
import { createQuizSchema } from '../../schemas/quiz/create-quiz.schema';
import { deleteQuizSchema } from '../../schemas/quiz/delete-quiz.schema';
import { updateQuizSchema } from '../../schemas/quiz/update-quiz.schema';
import { createSectionSchema } from '../../schemas/section/create-section.schema';
import { Trace, MonitorGrpc } from '@/shared/utils/decorators';
import { getCourseBySlugSchema } from '../../schemas/course/get-course-by-slug.schema';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { COURSE_MESSAGES } from '../../utils/resposne-messages';
import { getReviewsByCourseSchema } from '../../schemas/get-reviews-by-course.schema';
import { deleteCourseSchema } from '../../schemas/course/delete-course.schema';
import { publishCourseSchema } from '../../schemas/course/publish-course.schema';
import { CourseResponseMapper } from '../../utils/mappers';
import { EnrollmentService } from '@/domains/service-clients/enrollment';
import { CourseStats } from '@/domains/service-clients/course/proto/generated/course/types/stats';
import { getInstructorCourseStatsSchema } from '../../schemas/course/get-instructor-course-stats.schema';
import { WalletService } from '@/domains/service-clients/wallet';
import { unPublishCourseSchema } from '../../schemas/course/unpublish-course.schema';
import { getCourseSummerySchema } from '../../schemas/course/get-course-summery.schema copy';
import { injectable, inject } from 'inversify';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { TracingService } from '@/services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';
import { TYPES } from '@/services/di';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.UserService) private userServiceClient: UserService,
    @inject(TYPES.EnrollmentService)
    private enrollmentService: EnrollmentService,
    @inject(TYPES.WalletService) private walletService: WalletService,
    @inject(TYPES.CourseService) private courseServiceClient: CourseService,
    @inject(TYPES.LoggingService) private logger: LoggingService,
    @inject(TYPES.TracingService) private tracer: TracingService,
    @inject(TYPES.MetricsService) private monitor: MetricsService
  ) {}

  @Trace('CourseController.createCourse')
  @MonitorGrpc('CourseService', 'createCourse')
  async createCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        instructorId: req.user?.userId!,
        instructor: {
          id: req.user?.userId,
          name: req.user?.username,
          avatar: req.user?.avatar || '',
          email: req.user?.email,
        },
      },
      createCourseSchema
    )!;

    const { course } = await this.courseServiceClient.createCourse(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_CREATED.statusCode)
      .success(
        CourseResponseMapper.toCourse(course!),
        COURSE_MESSAGES.COURSE_CREATED.message
      );
  }

  @Trace('CourseController.updateCourse')
  @MonitorGrpc('CourseService', 'updateCourse')
  async updateCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        instructorId: req.user?.userId,
        ...req.user,
      },
      updateCourseSchema
    )!;

    const { course } = await this.courseServiceClient.updateCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_UPDATED.statusCode)
      .success(
        CourseResponseMapper.toCourse(course!),
        COURSE_MESSAGES.COURSE_UPDATED.message
      );
  }

  @Trace('CourseController.getCourse')
  @MonitorGrpc('CourseService', 'getCourse')
  async getCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getCourseSchema
    )!;

    const { course } = await this.courseServiceClient.getCourse(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success(
        CourseResponseMapper.toCourse(course!),
        COURSE_MESSAGES.COURSE_FETCHED.message
      );
  }

  @Trace('CourseController.getCourseAnalytics')
  async getCourseAnalytics(req: Request, res: Response) {
    interface CourseAnalytics {
      courseId: string;
      totalStudents?: number;
      completionRate?: number;
      averageProgress?: number;
      monthlyRevenue?: number;
      engagementRate?: number;
      revenueThisMonth?: number;
      revenueTotal?: number;
      ratingsBreakdown?: Record<1 | 2 | 3 | 4 | 5, number>;
      enrollmentTrend?: {
        date?: string;
        enrollments?: number;
      }[];
    }

    const { courseId, instructorId } = validateSchema(
      { instructorId: req.user?.userId, ...req.params },
      getCourseSummerySchema
    )!;

    const from = req.query.from as string;
    const to = req.query.to as string;
    const year =
      (req.query.year as string) || new Date().getFullYear().toString();

    const [
      { success: ratingsStats },
      { success: revenueSummery },
      { success: courseEnrollmentSummary },
      { success: courseEnrollmentTrend },
    ] = await Promise.all([
      this.courseServiceClient.getInstructorCourseRatingStats(
        { courseId, instructorId },
        { metadata: attachMetadata(req) }
      ),
      this.walletService.getInstructorRevenueSummery(
        { instructorId },
        { metadata: attachMetadata(req) }
      ),
      this.enrollmentService.getInstructorCourseEnrollmentSummery(
        { courseId, instructorId },
        { metadata: attachMetadata(req) }
      ),
      this.enrollmentService.getInstructorCourseEnrollmentTrend(
        {
          courseId,
          instructorId,
          from,
          to,
        },
        { metadata: attachMetadata(req) }
      ),
    ]);

    const analytics: CourseAnalytics = {
      courseId,
      totalStudents: courseEnrollmentSummary?.totalStudents ?? 0,
      completionRate: courseEnrollmentSummary?.completionRate ?? 0,
      averageProgress: courseEnrollmentSummary?.avgProgress ?? 0,
      monthlyRevenue: revenueSummery?.thisMonthEarnings,
      engagementRate: 0,
      revenueThisMonth: revenueSummery?.thisMonthEarnings,
      revenueTotal: revenueSummery?.totalEarnings,
      ratingsBreakdown: ratingsStats?.breakdown ?? {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
      enrollmentTrend:
        courseEnrollmentTrend?.trend?.map(trend => ({
          month: trend.month,
          enrollments: trend.enrollments ?? 0,
        })) ?? [],
    };

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success<CourseAnalytics>(
        analytics,
        COURSE_MESSAGES.COURSE_FETCHED.message
      );
  }

  @Trace('CourseController.getCourseBySlug')
  @MonitorGrpc('CourseService', 'getCoursesBySlug')
  async getCourseBySlug(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getCourseBySlugSchema
    )!;

    const { course } = await this.courseServiceClient.getCoursesBySlug(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success(
        CourseResponseMapper.toCourse(course!),
        COURSE_MESSAGES.COURSE_FETCHED.message
      );
  }
  @Trace('CourseController.getCoursesStats')
  @MonitorGrpc('CourseService', 'getCoursesStats')
  async getCoursesStats(req: Request, res: Response) {
    const validPayload = validateSchema(
      { instructorId: req.user?.userId, ...req.params },
      getInstructorCourseStatsSchema
    )!;

    const { success, error } =
      await this.courseServiceClient.getInstructorCoursesStats(validPayload, {
        metadata: attachMetadata(req),
      });

    const stats = success
      ? {
          totalCourses: success.totalCourses ?? 0,
          totalStudents: success.totalStudents ?? 0,
          averageRating: success.averageRating ?? 0,
          totalRevenue: success.averageRevenue ?? 0,
        }
      : {
          totalCourses: 0,
          totalStudents: 0,
          averageRating: 0,
          totalRevenue: 0,
        };

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success(stats, COURSE_MESSAGES.COURSE_FETCHED.message);
  }

  @Trace('CourseController.getCoursesByInstructor')
  @MonitorGrpc('CourseService', 'getCoursesByInstructor')
  async getCoursesByInstructor(req: Request, res: Response) {
    const { instructorId, pagination } = validateSchema(
      { ...req.body, ...req.params },
      getCourseByInstructorSchema
    )!;

    const { courses } = await this.courseServiceClient.getCoursesByInstructor(
      { instructorId, pagination },
      {
        metadata: attachMetadata(req),
      }
    );
    const mappedCourses = courses?.courses.map(
      CourseResponseMapper.toCourseMeta
    );

    // const mappedCourses = courses?.courses.map(CourseResponseMapper.toCourseResponse);
    // const instructorIds = Array.from(
    //   new Set(mappedCourses?.map(c => c.instructorId!))
    // );
    // const usersMap: Record<string, any> = {};
    // const promiseErrors: Error[] = [];
    // await Promise.all(
    //   instructorIds.map(async (userId: string) => {
    //     try {
    //       const { user } = await this.userServiceClient.getUser({ userId });
    //       usersMap[userId] = {
    //         avatar: user?.avatar,
    //         id: user?.userId,
    //         name: `${user?.firstName} ${user?.lastName}`,
    //       };
    //     } catch (error) {
    //       promiseErrors.push(error as Error);
    //     }
    //   })
    // );
    // if (promiseErrors.length !== 0) {
    //   throw AggregateError(
    //     promiseErrors,
    //     'Error while trying to merge instructor data with course id'
    //   );
    // }

    // // const instructorIds = Array.from(
    // //   new Set(mappedCourses?.map(c => c.instructorId!))
    // // );
    // // let usersMap: Record<string, any> = {};

    // // const { success } = await this.userServiceClient.getUsersByIds({
    // //   userIds: instructorIds,
    // // });

    // // usersMap = success?.users.reduce((userMap: typeof usersMap, user) => {
    // //   userMap[user.userId] = {
    // //     avatar: user.avatar,
    // //     id: user.userId,
    // //     name: `${user.firstName} ${user.lastName}`,
    // //   };
    // //   return userMap;
    // // }, {})!;

    // return new ResponseWrapper(res).status(HttpStatus.OK).success(
    //   {
    //     courses: mappedCourses?.map(course => ({
    //       ...course,
    //       instructor: usersMap[course.instructorId!],
    //     })),

    //     total: courses?.total,
    //   },
    //   'Courses by Instructor fetched successfully'
    // );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSES_BY_INSTRUCTOR.statusCode)
      .success(
        mappedCourses,
        COURSE_MESSAGES.COURSES_BY_INSTRUCTOR.message,
        mapPaginationResponse(pagination!, courses?.total)
      );
  }

  @Trace('CourseController.deleteCourse')
  @MonitorGrpc('CourseService', 'deleteCourse')
  async deleteCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...(req.user?.role === 'admin'
          ? { isAdmin: true }
          : { userId: req.user?.userId, isAdmin: false }),
        ...req.params,
      },
      deleteCourseSchema
    )!;

    const serverResponse = await this.courseServiceClient.deleteCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_DELETED.statusCode)
      .success({ deleted: true }, COURSE_MESSAGES.COURSE_DELETED.message);
  }

  @Trace('CourseController.publishCourse')
  @MonitorGrpc('CourseService', 'publishCourse')
  async publishCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...(req.user?.role === 'admin'
          ? { isAdmin: true }
          : { userId: req.user?.userId, isAdmin: false }),
        ...req.params,
      },
      publishCourseSchema
    )!;

    const { course } = await this.courseServiceClient.publishCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_UPDATED.statusCode)
      .success(course, COURSE_MESSAGES.COURSE_UPDATED.message);
  }

  @Trace('CourseController.unPublishCourse')
  @MonitorGrpc('CourseService', 'unPublishCourse')
  async unPublishCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...(req.user?.role === 'admin'
          ? { isAdmin: true }
          : { userId: req.user?.userId, isAdmin: false }),
        ...req.params,
      },
      unPublishCourseSchema
    )!;

    const { course } = await this.courseServiceClient.unPublishCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_UPDATED.statusCode)
      .success(course, COURSE_MESSAGES.COURSE_UPDATED.message);
  }

  @Trace('CourseController.getCourses')
  @MonitorGrpc('CourseService', 'listCourses')
  async getCourses(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        params: {
          pagination: req.query,
          filters: req.query,
        },
      },
      getCoursesSchema
    )!;

    const { courses } = await this.courseServiceClient.listCourses(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSES_FETCHED.statusCode)
      .success(
        courses?.courses.map(CourseResponseMapper.toCourseMeta),
        COURSE_MESSAGES.COURSES_FETCHED.message,
        mapPaginationResponse(validPayload.params?.pagination!, courses?.total)
      );
  }

  @Trace('CourseController.getEnrolledCourses')
  @MonitorGrpc('CourseService', 'getEnrolledCourses')
  async getEnrolledCourses(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getEnrolledCoursesSchema
    )!;

    const { courses } = await this.courseServiceClient.getEnrolledCourses(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.ENROLLED_COURSES_FETCHED.statusCode)
      .success(
        courses?.courses.map(CourseResponseMapper.toCourseMeta),
        COURSE_MESSAGES.ENROLLED_COURSES_FETCHED.message,
        mapPaginationResponse(validPayload.pagination!, courses?.total)
      );
  }

  @Trace('CourseController.getSection')
  @MonitorGrpc('CourseService', 'getSection')
  async getSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getSectionSchema
    )!;

    const { section } = await this.courseServiceClient.getSection(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.SECTION_FETCHED.statusCode)
      .success(
        CourseResponseMapper.toSection(section!),
        COURSE_MESSAGES.SECTION_FETCHED.message
      );
  }

  @Trace('CourseController.createSection')
  @MonitorGrpc('CourseService', 'createSection')
  async createSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      createSectionSchema
    )!;

    const { section } = await this.courseServiceClient.createSection(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.SECTION_CREATED.statusCode)
      .success(
        CourseResponseMapper.toSection(section!),
        COURSE_MESSAGES.SECTION_CREATED.message
      );
  }

  @Trace('CourseController.deleteSection')
  @MonitorGrpc('CourseService', 'deleteSection')
  async deleteSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      deleteSectionSchema
    )!;

    const { success } = await this.courseServiceClient.deleteSection(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.SECTION_DELETED.statusCode)
      .success({ deleted: true }, COURSE_MESSAGES.SECTION_DELETED.message);
  }

  @Trace('CourseController.updateSection')
  @MonitorGrpc('CourseService', 'updateSection')
  async updateSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      updateSectionSchema
    )!;

    const { section } = await this.courseServiceClient.updateSection(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.SECTION_UPDATED.statusCode)
      .success(
        CourseResponseMapper.toSection(section!),
        COURSE_MESSAGES.SECTION_UPDATED.message
      );
  }

  @Trace('CourseController.getSectionsByCourse')
  @MonitorGrpc('CourseService', 'getSectionsByCourse')
  async getSectionsByCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getSectionsByCourseSchema
    )!;

    const { sections } = await this.courseServiceClient.getSectionsByCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.SECTIONS_FETCHED.statusCode)
      .success(
        { sections: sections?.sections.map(CourseResponseMapper.toSection) },
        COURSE_MESSAGES.SECTIONS_FETCHED.message
      );
  }

  @Trace('CourseController.getLesson')
  @MonitorGrpc('CourseService', 'getLesson')
  async getLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getLessonSchema
    )!;

    const { lesson } = await this.courseServiceClient.getLesson(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.LESSON_FETCHED.statusCode)
      .success(
        CourseResponseMapper.toLesson(lesson!),
        COURSE_MESSAGES.LESSON_FETCHED.message
      );
  }

  @Trace('CourseController.createLesson')
  @MonitorGrpc('CourseService', 'createLesson')
  async createLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      createLessonSchema
    )!;

    const { lesson } = await this.courseServiceClient.createLesson(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.LESSON_CREATED.statusCode)
      .success(
        CourseResponseMapper.toLesson(lesson!),
        COURSE_MESSAGES.LESSON_CREATED.message
      );
  }

  @Trace('CourseController.deleteLesson')
  @MonitorGrpc('CourseService', 'deleteLesson')
  async deleteLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      deleteLessonSchema
    )!;

    const serverResponse = await this.courseServiceClient.deleteLesson(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.LESSON_DELETED.statusCode)
      .success({ deleted: true }, COURSE_MESSAGES.LESSON_DELETED.message);
  }

  @Trace('CourseController.updateLesson')
  @MonitorGrpc('CourseService', 'updateLesson')
  async updateLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      updateLessonSchema
    )!;

    const { lesson } = await this.courseServiceClient.updateLesson(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.LESSON_UPDATED.statusCode)
      .success(
        CourseResponseMapper.toLesson(lesson!),
        COURSE_MESSAGES.LESSON_UPDATED.message
      );
  }

  @Trace('CourseController.getLessonsBySection')
  @MonitorGrpc('CourseService', 'getLessonsBySection')
  async getLessonsBySection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getLessonsBySectionSchema
    )!;

    const { lessons } = await this.courseServiceClient.getLessonsBySection(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.LESSONS_FETCHED.statusCode)
      .success(
        { lessons: lessons?.lessons.map(CourseResponseMapper.toLesson) },
        COURSE_MESSAGES.LESSONS_FETCHED.message
      );
  }

  @Trace('CourseController.getQuizzesByCourse')
  @MonitorGrpc('CourseService', 'getQuizzesByCourse')
  async getQuizzesByCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getQuizzesByCourseSchema
    )!;

    const { quizzes } = await this.courseServiceClient.getQuizzesByCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    // Provided previous message seems off, fallback to generic quizzes fetched
    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.QUIZZES_FETCHED.statusCode)
      .success(
        { quizzes: quizzes?.quizzes.map(CourseResponseMapper.toQuiz) },
        COURSE_MESSAGES.QUIZZES_FETCHED.message
      );
  }

  @Trace('CourseController.getQuiz')
  @MonitorGrpc('CourseService', 'getQuiz')
  async getQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getQuizSchema
    )!;

    const { quiz } = await this.courseServiceClient.getQuiz(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.QUIZ_FETCHED.statusCode)
      .success(
        CourseResponseMapper.toQuiz(quiz!),
        COURSE_MESSAGES.QUIZ_FETCHED.message
      );
  }

  @Trace('CourseController.createQuiz')
  @MonitorGrpc('CourseService', 'createQuiz')
  async createQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      createQuizSchema
    )!;

    const { quiz } = await this.courseServiceClient.createQuiz(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.QUIZ_CREATED.statusCode)
      .success(
        CourseResponseMapper.toQuiz(quiz!),
        COURSE_MESSAGES.QUIZ_CREATED.message
      );
  }

  @Trace('CourseController.deleteQuiz')
  @MonitorGrpc('CourseService', 'deleteQuiz')
  async deleteQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      deleteQuizSchema
    )!;

    const serverResponse = await this.courseServiceClient.deleteQuiz(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.QUIZ_DELETED.statusCode)
      .success({ deleted: true }, COURSE_MESSAGES.QUIZ_DELETED.message);
  }

  @Trace('CourseController.updateQuiz')
  @MonitorGrpc('CourseService', 'updateQuiz')
  async updateQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, ...req.user },
      updateQuizSchema
    )!;

    const { quiz } = await this.courseServiceClient.updateQuiz(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.QUIZ_UPDATED.statusCode)
      .success(
        CourseResponseMapper.toQuiz(quiz!),
        COURSE_MESSAGES.QUIZ_UPDATED.message
      );
  }

  // ------------------ REVIEWS ---------------------------

  @Trace('CourseController.getReviewsByCourse')
  @MonitorGrpc('EnrollmentService', 'getReviewsByCourse')
  async getReviewsByCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        pagination: req.query,
        ...req.params,
      },
      getReviewsByCourseSchema
    )!;

    const { reviews } = await this.enrollmentService.getReviewsByCourse(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSES_FETCHED.statusCode)
      .success(
        reviews?.reviews.map(CourseResponseMapper.toReview),
        COURSE_MESSAGES.COURSES_FETCHED.message,
        mapPaginationResponse(validPayload.pagination!, reviews?.total)
      );
  }
}
