import { UserService } from '@/domains/service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '@/services/security/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';

import { NotificationService } from '@/domains/service-clients/notification';

import { blockUserSchema } from '../schemas/user/block-user.schema';
import { updateUserSchema } from '../schemas/user/update-user.schema';
import { unBlockUserSchema } from '../schemas/user/unblock-user.schema';
import { detailedUserSchema } from '../schemas/user/get-user.schema';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { TracingService } from '@/services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';
import { UserData } from '@/domains/service-clients/user/proto/generated/user/types/user_types';
import { updateCurrentUserSchema } from '../schemas/user/update-current-user.schema';
import { currentUserSchema } from '../schemas/user/current-user.schema';
import { registerInstructorSchema } from '../schemas/user/register-instructor.schema';
import { attachMetadata } from '../utils/attach-metadata';
import { User } from '../types';
import { USER_MESSAGES } from '../utils/user/user-resposne-messages';
import { getUsersSchema } from '../schemas/user/get-users.schema';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { UserResponseMapper } from '../utils/user/user.mappers';
import { listInstructorsOfStudentSchema } from '../schemas/user/list-instructors-of-student.schema';
import { listStudentsOfInstructorSchema } from '../schemas/user/list-students-of-instructor.schema';
import { getInstructorCourseStatsSchema } from '@/domains/course/v1/schemas/course/get-instructor-course-stats.schema';
import { WalletService } from '@/domains/service-clients/wallet';
import { EnrollmentService } from '@/domains/service-clients/enrollment';
import { CourseService } from '@/domains/service-clients/course';
import { COURSE_MESSAGES } from '@/domains/course/v1/utils/response-messages/course-messages';
import { getInstructorStatsSchema } from '@/domains/course/v1/schemas/course/get-instructor-stats.schema';
import {
  InstructorsStats,
  UsersStats,
} from '@/domains/service-clients/user/proto/generated/user/types/stats_types';
import { getCourseSummerySchema } from '@/domains/course/v1/schemas/course/get-course-summery.schema';
import { RedisService } from '@/services/redis';
import { Cache } from '@/services/decorators/cache';
import { RESPONSE_CACHE_KEYS } from '@/services/redis/cache-keys';
import { ADMIN_MESSAGES } from '@/domains/admin/v1/utils/resposne-messages';
import { getInstructorsSchema } from '../schemas/user/get-instructors.schema';
import { ChatService } from '@/domains/service-clients/chat';

import { injectable, inject } from 'inversify';
import { Trace, MonitorGrpc } from '@/services/decorators/decorators';
import { TYPES } from '@/services/di';
import { Observe } from '@/services/observability/decorators';
import { BloomFilterFacade } from '@/services/bloom-filter';

@injectable()
@Observe({ logLevel: 'debug' })
export class InstructorController {
  private _bloomFilterService!: BloomFilterFacade;
  constructor(
    @inject(TYPES.UserService) private userServiceClient: UserService,
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
    @inject(TYPES.WalletService) private walletService: WalletService,
    @inject(TYPES.EnrollmentService)
    private enrollmentService: EnrollmentService,
    @inject(TYPES.ChatService) private chatService: ChatService,
    @inject(TYPES.CourseService) private courseServiceClient: CourseService,
    @inject(TYPES.RedisService) private cacheService: RedisService,
    @inject(TYPES.LoggingService) private logger: LoggingService,
    @inject(TYPES.TracingService) private tracer: TracingService,
    @inject(TYPES.MetricsService) private monitor: MetricsService
  ) { }

  private get bloomFilterService(): BloomFilterFacade {
    if (!this._bloomFilterService) {
      this.logger.debug('Initializing BloomFilterFacade...');
      this._bloomFilterService = BloomFilterFacade.getInstance();
    }
    return this._bloomFilterService;
  }


  async listInstructors(req: Request, res: Response): Promise<void> {
    const {
      page,
      pageSize,
      name: search,
      status,
      sortBy,
      sortOrder,
      email,
    } = req.query;

    const validPayload = validateSchema(
      {
        pagination: { page, pageSize },
        filter: { search, status, email },
        sort: { field: sortBy || 'createdAt', order: sortOrder || 'desc' },
      },
      getInstructorsSchema
    )!;

    const { instructors } = await this.userServiceClient.listInstructors(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      Number(instructors?.pagination?.totalItems ?? 0),
    );

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.INSTRUCTORS_FETCH_SUCCESS.statusCode)
      .success(
        instructors?.instructors.map(UserResponseMapper.toInstructorMetadata) ??
        [],
        ADMIN_MESSAGES.INSTRUCTORS_FETCH_SUCCESS.message,
        paginationResponse
      );
  }


  async registerInstructor(req: Request, res: Response) {
    const validatedUserData = validateSchema(
      { ...req.body, userId: req.user?.userId },
      registerInstructorSchema
    )!;

    const { success } = await this.userServiceClient.registerInstructor(
      validatedUserData,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.INSTRUCTOR_REGISTERED.statusCode)
      .success(
        UserResponseMapper.toUser(success?.user!),
        USER_MESSAGES.INSTRUCTOR_REGISTERED.message
      );
  }



  async listStudentsOfInstructor(req: Request, res: Response) {
    const validPayload = validateSchema(
      { pagination: req.query, instructorId: req.user?.userId },
      listStudentsOfInstructorSchema
    )!;

    const { users } = await this.userServiceClient.listStudentsOfInstructor(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      users?.pagination?.totalItems
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USERS_FETCHED.statusCode)
      .success(
        users?.users.map(UserResponseMapper.toUserInfo),
        USER_MESSAGES.USERS_FETCHED.message,
        paginationResponse
      );
  }

  async getInstructorCoursesStats(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        instructorId: req.params?.instructorId || req.user?.userId,
        ...req.params,
      },
      getInstructorCourseStatsSchema
    )!;
    const [
      { success: instructorCourseStats },
      { success: revenueSummary },
      { success: coursesEnrollmentSummary },
    ] = await Promise.all([
      this.courseServiceClient.getInstructorCoursesStats(validPayload, {
        metadata: attachMetadata(req),
      }),
      this.walletService.getInstructorRevenueSummery(validPayload, {
        metadata: attachMetadata(req),
      }),
      this.enrollmentService.getInstructorCoursesEnrollmentSummery(
        validPayload,
        { metadata: attachMetadata(req) }
      ),
    ]);

    const mappedStats = {
      published: instructorCourseStats?.publishedCourses ?? 0,
      averageRating: instructorCourseStats?.averageRating ?? 0,
      totalHoursTaught: instructorCourseStats?.totalHoursTaught ?? 0,
      totalReviews: instructorCourseStats?.totalReviews ?? 0,
      draft: instructorCourseStats?.draftCourses ?? 0,
      totalEnrollments: coursesEnrollmentSummary?.totalStudents ?? 0,
      enrollmentGrowth: coursesEnrollmentSummary?.enrollmentGrowth ?? 0,
      activeStudents: coursesEnrollmentSummary?.activeStudents ?? 0,
      monthlyRevenue: revenueSummary?.thisMonthEarnings ?? 0,
      revenueGrowth:
        revenueSummary &&
          typeof revenueSummary.lastMonthEarnings === 'number' &&
          revenueSummary.lastMonthEarnings !== 0
          ? (
            (((revenueSummary.thisMonthEarnings ?? 0) -
              (revenueSummary.lastMonthEarnings ?? 0)) /
              (revenueSummary.lastMonthEarnings ?? 1)) *
            100
          ).toFixed(2)
          : '0.00',
      avgCompletionRate: coursesEnrollmentSummary?.avgCompletion ?? 0,
    };


    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success<
        typeof mappedStats
      >(mappedStats, COURSE_MESSAGES.COURSE_FETCHED.message);
  }


  async getInstructorsStats(req: Request, res: Response) {
    type InstructorsStats = {
      total: number;
      active: number;
      inactive: number;
      pending: number;
      newThisMonth: number;
      totalCourses: number;
      newCourses: number;
      averageRating: number;
      ratingChange: number;
    };

    const [{ success: instructorsStats }, { success: coursesStats }] =
      await Promise.all([
        this.userServiceClient.getInstructorsStats(
          {},
          {
            metadata: attachMetadata(req),
          }
        ),
        this.courseServiceClient.getCoursesStats(
          {},
          {
            metadata: attachMetadata(req),
          }
        ),
      ]);

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success<InstructorsStats>(
        {
          active: instructorsStats?.active,
          total: instructorsStats?.total,
          inactive: instructorsStats?.inactive,
          pending: instructorsStats?.inactive,
          newThisMonth: instructorsStats?.newThisMonth,
          totalCourses: coursesStats?.totalCourses,
          newCourses: coursesStats?.draftCourses,
          averageRating: 0,
          ratingChange: 0,
        } as InstructorsStats,
        COURSE_MESSAGES.COURSE_FETCHED.message
      );
  }

  async getInstructorCourseAnalytics(req: Request, res: Response) {
    interface CourseAnalytics {
      totalStudents?: number;
      completionRate?: number;
      averageProgress?: number;
      averageRating?: number;
      totalRevenue?: number;
      monthlyRevenue?: number;
      engagementRate?: number;
      revenueThisMonth?: number;
      revenueGrowth?: number;
      totalReviews?: number;
      certificatesIssued?: number;
      ratingsBreakdown?: Record<1 | 2 | 3 | 4 | 5, number>;
      enrollmentTrend?: {
        date?: string;
        enrollments?: number;
      }[];
    }

    const { courseId, instructorId } = validateSchema(
      {
        instructorId: req.params?.instructorId || req.user?.userId,
        ...req.params,
      },
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
      this.enrollmentService.getInstructorCourseRevenueSummery(
        { instructorId, courseId },
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
      totalStudents: courseEnrollmentSummary?.totalStudents ?? 0,
      certificatesIssued: courseEnrollmentSummary?.totalStudents ?? 0,
      completionRate: courseEnrollmentSummary?.completionRate ?? 0,
      averageProgress: courseEnrollmentSummary?.avgProgress ?? 0,
      monthlyRevenue: revenueSummery?.avgRevenue,
      engagementRate: 0,
      revenueThisMonth: revenueSummery?.thisMonthRevenue,
      totalRevenue: revenueSummery?.totalRevenue,
      revenueGrowth: revenueSummery?.revenueGrowth,
      averageRating: ratingsStats?.averageRating || 0,
      totalReviews: ratingsStats?.totalRatings || 0,
      ratingsBreakdown: ratingsStats?.breakdown ?? {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
      enrollmentTrend:
        courseEnrollmentTrend?.trend?.map(trend => ({
          month: trend.month ?? 0,
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

  async getInstructorStats(req: Request, res: Response) {
    type InstructorStats = {
      totalStudents: number;
      totalRevenue: number;
      activeCourses: number;
      averageRating: number;
      totalHours: number;
      completionRate: number;
      monthlyRevenue: number;
      revenueGrowth: string;
      monthlyEnrollments: number;
      totalReviews: number;
    };

    const { instructorId } = validateSchema(
      { instructorId: req.params?.instructorId || req.user?.userId },
      getInstructorStatsSchema
    )!;

    const year =
      req.query.year?.toString() || new Date().getFullYear().toString();
    const from = req.query.from?.toString();
    const to = req.query.to?.toString();

    const [
      { success: courseStats },
      { success: revenueStats },
      { success: enrollStats },
    ] = await Promise.all([
      this.courseServiceClient.getInstructorCoursesStats(
        { instructorId },
        { metadata: attachMetadata(req) }
      ),
      this.walletService.getInstructorRevenueSummery(
        { instructorId },
        { metadata: attachMetadata(req) }
      ),
      this.enrollmentService.getInstructorCoursesEnrollmentSummery(
        { instructorId },
        { metadata: attachMetadata(req) }
      ),
    ]);

    console.log(
      'Instructor stats : ' +
      JSON.stringify({ courseStats, revenueStats, enrollStats }, null, 2)
    );

    const stats: InstructorStats = {
      totalStudents: enrollStats?.totalStudents ?? 0,
      totalRevenue: revenueStats?.totalEarnings ?? 0,
      activeCourses: courseStats?.publishedCourses ?? 0,

      averageRating: courseStats?.averageRating ?? 0,

      totalHours: (courseStats?.totalCourses ?? 0) * 10,
      completionRate: enrollStats?.avgCompletion ?? 0,
      monthlyRevenue: revenueStats?.thisMonthEarnings ?? 0,
      revenueGrowth:
        revenueStats &&
          typeof revenueStats.lastMonthEarnings === 'number' &&
          revenueStats.lastMonthEarnings !== 0
          ? (
            (((revenueStats.thisMonthEarnings ?? 0) -
              (revenueStats.lastMonthEarnings ?? 0)) /
              (revenueStats.lastMonthEarnings ?? 1)) *
            100
          ).toFixed(2)
          : '0.00',

      monthlyEnrollments: enrollStats?.totalStudents ?? 0,
      totalReviews: courseStats?.totalStudents ?? 0,
    };

    return new ResponseWrapper(res)
      .status(200)
      .success<InstructorStats>(stats, 'Instructor stats fetched successfully');
  }
}
