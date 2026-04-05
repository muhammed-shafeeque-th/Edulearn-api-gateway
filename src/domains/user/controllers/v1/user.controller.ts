import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';

import { NotificationService } from '../../../service-clients/notification';

import { blockUserSchema } from '../../schemas/block-user.schema';
import { updateUserSchema } from '../../schemas/update-user.schema';
import { unBlockUserSchema } from '../../schemas/unblock-user.schema';
import { detailedUserSchema } from '../../schemas/get-user.schema';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { TracingService } from '@/services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';
import { UserData } from '@/domains/service-clients/user/proto/generated/user/types/user_types';
import { updateCurrentUserSchema } from '../../schemas/update-current-user.schema';
import { currentUserSchema } from '../../schemas/current-user.schema';
import { registerInstructorSchema } from '../../schemas/register-instructor.schema';
import { attachMetadata } from '@/shared/utils/attach-metadata';
import { User } from '../../types';
import { USER_MESSAGES } from '../../utils/resposne-messages';
import { getUsersSchema } from '../../schemas/get-users.schema';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { UserResponseMapper } from '../../utils/mappers';
import { listInstructorsOfStudentSchema } from '../../schemas/list-instructors-of-student.schema';
import { listStudentsOfInstructorSchema } from '../../schemas/list-students-of-instructor.schema';
import { getInstructorCourseStatsSchema } from '@/domains/course/schemas/course/get-instructor-course-stats.schema';
import { WalletService } from '@/domains/service-clients/wallet';
import { EnrollmentService } from '@/domains/service-clients/enrollment';
import { CourseService } from '@/domains/service-clients/course';
import { COURSE_MESSAGES } from '@/domains/course/utils/resposne-messages';
import { getInstructorStatsSchema } from '@/domains/course/schemas/course/get-instructor-stats.schema';
import {
  InstructorsStats,
  UsersStats,
} from '@/domains/service-clients/user/proto/generated/user/types/stats_types';
import { getCourseSummerySchema } from '@/domains/course/schemas/course/get-course-summery.schema copy';
import { RedisService } from '@/services/redis';
import { Cache } from '@/services/decorators/cache';
import { RESPONSE_CACHE_KEYS } from '@/services/redis/cache-keys';
import { ADMIN_MESSAGES } from '@/domains/admin/utils/resposne-messages';
import { getInstructorsSchema } from '../../schemas/get-instructors.schema';
import { ChatService } from '@/domains/service-clients/chat';

import { injectable, inject } from 'inversify';
import { Trace, MonitorGrpc } from '@/shared/utils/decorators';
import { TYPES } from '@/services/di';
import { Observe } from '@/services/observability/decorators';
import { BloomFilterFacade } from '@/services/bloom-filter';

@injectable()
@Observe({ logLevel: 'debug' })
export class UserController {
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
  ) {}

  private get bloomFilterService(): BloomFilterFacade {
    if (!this._bloomFilterService) {
      this.logger.debug('Initializing BloomFilterFacade...');
      this._bloomFilterService = BloomFilterFacade.getInstance();
    }
    return this._bloomFilterService;
  }

  // @Trace('UserController.getUser')
  // @MonitorGrpc('UserService', 'getUser')
  async getUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.params, detailedUserSchema)!;

    const { user } = await this.userServiceClient.getUser(
      { userId },
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USER_FETCHED.statusCode)
      .success(
        UserResponseMapper.toUser(user!),
        USER_MESSAGES.USER_FETCHED.message
      );
  }
  async checkUsername(req: Request, res: Response) {
    const email = String(req.params.email ?? '') as string;

    const isEmailAvailable =
      await this.bloomFilterService.isEmailAvailable(email);

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USER_FETCHED.statusCode)
      .success(!!isEmailAvailable, USER_MESSAGES.USER_FETCHED.message);
  }

  // @Trace('UserController.listInstructors')
  // @MonitorGrpc('UserService', 'listInstructors')
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
      instructors?.pagination?.totalItems
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

  // @Trace('UserController.getCurrentUser')
  // @MonitorGrpc('UserService', 'getCurrentUser')
  async getCurrentUser(req: Request, res: Response) {
    const { userId } = validateSchema(req.user, currentUserSchema)!;

    const { user } = await this.userServiceClient.getCurrentUser(
      { userId: req.user!.userId },
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.CURRENT_USER_FETCHED.statusCode)
      .success(
        UserResponseMapper.toUser(user!),
        USER_MESSAGES.CURRENT_USER_FETCHED.message
      );
  }

  // @Trace('UserController.getUsers')
  // @MonitorGrpc('UserService', 'getUsers')
  async getUsers(req: Request, res: Response) {
    const {
      page,
      pageSize,
      name: search,
      status,
      role,
      email,
      sortBy,
      sortOrder,
    } = req.query;

    const validPayload = validateSchema(
      {
        pagination: { page, pageSize },
        filter: { search, status, role, email },
        sort: { sortBy: sortBy || 'createdAt', sortOrder: sortOrder || 'desc' },
      },
      getUsersSchema
    )!;

    const { users } = await this.userServiceClient.listUsers(validPayload, {
      metadata: attachMetadata(req),
    });

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      users?.pagination?.totalItems
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USERS_FETCHED.statusCode)
      .success(
        users?.users.map(UserResponseMapper.toUserMetadata),
        USER_MESSAGES.USERS_FETCHED.message,
        paginationResponse
      );
  }

  // @Trace('UserController.getOnlineUsers')
  // @MonitorGrpc('ChatService', 'getOnlineUsers')
  async getOnlineUsers(req: Request, res: Response) {
    const { success } = await this.chatService.getOnlineUsers(
      {},
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USERS_FETCHED.statusCode)
      .success(success?.users, USER_MESSAGES.USERS_FETCHED.message);
  }

  // @Trace('UserController.updateUserData')
  // @MonitorGrpc('UserService', 'updateUserData')
  async updateUserData(req: Request, res: Response) {
    const validatedUserData = validateSchema(
      { ...req.body, ...req.params },
      updateUserSchema
    )!;

    const { user: updatedUser } =
      await this.userServiceClient.updateUserDetails(validatedUserData, {
        metadata: attachMetadata(req),
      });

    await this.cacheService.invalidateTag(`user:${req.user!.userId}`);

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USER_UPDATED.statusCode)
      .success(
        UserResponseMapper.toUser(updatedUser!),
        USER_MESSAGES.USER_UPDATED.message
      );
  }

  // @Trace('UserController.registerInstructor')
  // @MonitorGrpc('UserService', 'registerInstructor')
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

  // @Trace('UserController.updateCurrentUser')
  // @MonitorGrpc('UserService', 'updateCurrentUser')
  async updateCurrentUser(req: Request, res: Response) {
    const validatedUserData = validateSchema(
      { ...req.body, userId: req.user?.userId },
      updateCurrentUserSchema
    )!;

    const { user: updatedUser } =
      await this.userServiceClient.updateUserDetails(validatedUserData, {
        metadata: attachMetadata(req),
      });

    await this.cacheService.invalidateTag(`user:${req.user!.userId}`);
    await this.cacheService.invalidateTag(`instructor:${req.user!.userId}`);

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USER_UPDATED.statusCode)
      .success(
        UserResponseMapper.toUser(updatedUser!),
        USER_MESSAGES.USER_UPDATED.message
      );
  }

  // @Trace('UserController.listInstructorsOfStudent')
  // @MonitorGrpc('UserService', 'listInstructorsOfStudent')
  async listInstructorsOfStudent(req: Request, res: Response) {
    const validPayload = validateSchema(
      { pagination: req.query, studentId: req.user?.userId },
      listInstructorsOfStudentSchema
    )!;

    const { instructors } =
      await this.userServiceClient.listInstructorsOfStudent(validPayload, {
        metadata: attachMetadata(req),
      });

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      instructors?.pagination?.totalItems
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USERS_FETCHED.statusCode)
      .success(
        instructors?.instructors.map(UserResponseMapper.toUserInfo),
        USER_MESSAGES.USERS_FETCHED.message,
        paginationResponse
      );
  }

  // @Trace('UserController.listStudentsOfInstructor')
  // @MonitorGrpc('UserService', 'listStudentsOfInstructor')
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

  // @Trace('UserController.getInstructorCoursesStats')
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

    console.log('Mapped stats : ' + JSON.stringify(mappedStats, null, 2));

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success<
        typeof mappedStats
      >(mappedStats, COURSE_MESSAGES.COURSE_FETCHED.message);
  }

  // @Trace('UserController.getUsersStats')
  async getUsersStats(req: Request, res: Response) {
    const { success } = await this.userServiceClient.getUsersStats(
      {},
      {
        metadata: attachMetadata(req),
      }
    );

    console.log('Users stats : ' + JSON.stringify(success, null, 2));

    return new ResponseWrapper(res)
      .status(COURSE_MESSAGES.COURSE_FETCHED.statusCode)
      .success<UsersStats>(success!, COURSE_MESSAGES.COURSE_FETCHED.message);
  }

  // @Trace('UserController.getInstructorsStats')
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

  // @Trace('UserController.getInstructorCourseAnalytics')
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
      totalStudents: courseEnrollmentSummary?.totalStudents ?? 0,
      certificatesIssued: courseEnrollmentSummary?.totalStudents ?? 0,
      completionRate: courseEnrollmentSummary?.completionRate ?? 0,
      averageProgress: courseEnrollmentSummary?.avgProgress ?? 0,
      monthlyRevenue: revenueSummery?.thisMonthEarnings,
      engagementRate: 0,
      revenueThisMonth: revenueSummery?.thisMonthEarnings,
      totalRevenue: revenueSummery?.totalEarnings,
      revenueGrowth: Number(
        (
          ((revenueSummery?.thisMonthEarnings ??
            0 - (revenueSummery?.lastMonthEarnings ?? 0)) /
            (revenueSummery?.lastMonthEarnings ?? 0)) *
          100
        ).toFixed(2)
      ),
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

  // @Trace('UserController.getInstructorStats')
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
