import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';

import { NotificationService } from '../../../service-clients/notification';
import { blockUserSchema } from '../../schemas/block-user.schema';
import { updateUserSchema } from '../../schemas/update-user.schema';
import { unBlockUserSchema } from '../../schemas/unblock-user.schema';
import { detailedUserSchema } from '../../schemas/get-user.schema';
import { LoggingService } from 'services/observability/logging/logging.service';
import { HttpStatus } from '@/shared/constants/http-status';
import { attachMetadata } from '@/shared/utils/attach-metadata';
import { Observe } from '@/services/observability/decorators';
import { UserAccessService } from '@/services/user-blocklist.service';
import { CourseService } from '@/domains/service-clients/course';
import { OrderService } from '@/domains/service-clients/order';
import { AuthService } from '@/domains/service-clients/auth';
import { adminLoginSchema } from '../../schemas/admin-login.schema';
import { adminRefreshSchema } from '../../schemas/admin-refresh.schema';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { getUsersSchema } from '@/domains/user/schemas/get-users.schema';
import { USER_MESSAGES } from '@/domains/user/utils/resposne-messages';
import { UserService } from '@/domains/service-clients/user';
import {
  attachAdminCookies,
  clearAdminCookies,
} from '../../utils/manage-cookies';
import { getInstructorsSchema } from '@/domains/user/schemas/get-instructors.schema';
import { UserData } from '@/domains/service-clients/user/proto/generated/user/types/user_types';
import { ADMIN_MESSAGES } from '../../utils/resposne-messages';
import { adminRefreshToken, authRefreshToken } from '../../utils/constants';
import { UserResponseMapper } from '@/domains/user/utils/mappers';
import { EnrollmentService } from '@/domains/service-clients/enrollment';

@Observe({ logLevel: 'debug' })
export class AdminController {
  private readonly userServiceClient: UserService;
  private readonly courseServiceClient: CourseService;
  private readonly enrollmentServiceClient: EnrollmentService;
  private readonly orderServiceClient: OrderService;
  private readonly authServiceClient: AuthService;
  private readonly notificationServiceClient: NotificationService;
  private readonly userAccessService: UserAccessService;
  private readonly logger: LoggingService;

  constructor() {
    // Observability services
    this.logger = LoggingService.getInstance();

    // Business services
    this.userServiceClient = UserService.getInstance();
    this.notificationServiceClient = NotificationService.getInstance();
    this.userAccessService = UserAccessService.getInstance();
    this.authServiceClient = AuthService.getInstance();
    this.orderServiceClient = OrderService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
    this.enrollmentServiceClient = EnrollmentService.getInstance();
  }

  async adminLogin(req: Request, res: Response): Promise<void> {
    const validPayload = validateSchema({ ...req.body }, adminLoginSchema)!;

    const { success } = await this.authServiceClient.adminLogin(validPayload, {
      metadata: attachMetadata(req),
    })!;

    const resWrap = new ResponseWrapper(res);
    attachAdminCookies(resWrap, success!.refreshToken, success!.accessToken);
    return resWrap
      .status(ADMIN_MESSAGES.LOGIN_SUCCESS.statusCode)
      .success(
        { token: success!.accessToken },
        ADMIN_MESSAGES.LOGIN_SUCCESS.message
      );
  }
  async adminLogout(req: Request, res: Response): Promise<void> {
    const resWrap = new ResponseWrapper(res);
    clearAdminCookies(resWrap);
    return resWrap
      .status(ADMIN_MESSAGES.LOGIN_SUCCESS.statusCode)
      .success(null, ADMIN_MESSAGES.LOGIN_SUCCESS.message);
  }

  async adminRefresh(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'adminRefresh'`);
    const validPayload = validateSchema(
      {
        refreshToken: req.cookies[adminRefreshToken],
      },
      adminRefreshSchema
    )!;

    const { success } = await this.authServiceClient.adminRefresh(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    const resWrap = new ResponseWrapper(res);
    attachAdminCookies(resWrap, success!.refreshToken, success!.accessToken);
    return resWrap
      .status(ADMIN_MESSAGES.REFRESH_SUCCESS.statusCode)
      .success(
        { token: success!.accessToken },
        ADMIN_MESSAGES.REFRESH_SUCCESS.message
      );
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'blockUser'`);
    const validPayload = validateSchema({ ...req.params }, blockUserSchema)!;

    const serverResponse = await this.userServiceClient.blockUser(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );
    await this.userAccessService.blockUser(validPayload.userId);

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_BLOCK_SUCCESS.statusCode)
      .success(serverResponse.success, ADMIN_MESSAGES.USER_BLOCK_SUCCESS.message);
  }

  async unBlockUser(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'unBlockUser'`);
    const validPayload = validateSchema({ ...req.params }, unBlockUserSchema)!;

    const { success } = await this.userServiceClient.unBlockUser(validPayload, {
      metadata: attachMetadata(req),
    })!;
    await this.userAccessService.unblockUser(validPayload.userId);

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_UNBLOCK_SUCCESS.statusCode)
      .success(success, ADMIN_MESSAGES.USER_UNBLOCK_SUCCESS.message);
  }

  async getUser(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'getUser'`);
    const validPayload = validateSchema(req.params, detailedUserSchema)!;

    const { user } = await this.userServiceClient.getUser(validPayload, {
      metadata: attachMetadata(req),
    })!;

    if (!user) {
      return new ResponseWrapper(res)
        .status(ADMIN_MESSAGES.USER_NOT_FOUND.statusCode)
        .error('NOT_FOUND', ADMIN_MESSAGES.USER_NOT_FOUND.message);
      return;
    }

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(UserResponseMapper.toUser(user), 'User fetched successfully');
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'getUsers'`);

    const validPayload = validateSchema(
      { pagination: req.query },
      getUsersSchema
    )!;
    const { users } = await this.userServiceClient.listUsers(validPayload, {
      metadata: attachMetadata(req),
    })!;

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      users?.pagination?.totalItems
    );

    return new ResponseWrapper(res)
      .status(USER_MESSAGES.USERS_FETCHED.statusCode)
      .success(
        (users?.users ?? []).map(UserResponseMapper.toUserMetadata),
        USER_MESSAGES.USERS_FETCHED.message,
        paginationResponse
      );
  }

  async getAllInstructors(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'getAllInstructors'`);

    const validPayload = validateSchema(
      { pagination: req.params },
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
        instructors?.instructors.map(UserResponseMapper.toInstructorMetadata) ?? [],
        ADMIN_MESSAGES.INSTRUCTORS_FETCH_SUCCESS.message,
        paginationResponse
      );
  }

  async updateUserData(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'updateUserData'`);
    const validatedUserData = validateSchema(
      { ...req.params, ...req.body },
      updateUserSchema
    )!;

    const { user: updatedUser } =
      await this.userServiceClient.updateUserDetails(validatedUserData, {
        metadata: attachMetadata(req),
      })!;

    if (!updatedUser) {
      return new ResponseWrapper(res)
        .status(ADMIN_MESSAGES.USER_NOT_FOUND.statusCode)
        .error('NOT_FOUND', ADMIN_MESSAGES.USER_NOT_FOUND.message);
      return;
    }

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_DATA_UPDATED.statusCode)
      .success(
        UserResponseMapper.toUser(updatedUser),
        ADMIN_MESSAGES.USER_DATA_UPDATED.message
      );
  }
  async getSystemOverview(req: Request, res: Response): Promise<void> {
    this.logger.info("Processing grpc method 'getSystemOverview'");

    type SystemOverview = {
      totalUsers: number;
      activeInstructors: number;
      totalCourses: number;
      monthlyRevenue: number;
    };

    try {
      const range: string = req.query.range?.toString() || 'thisMonth';

      // Await multiple independent service calls in parallel for performance.
      const [
        { success: userStats },
        { success: instructorStats },
        { success: courseStats },
        { success: revenueStats }
      ] = await Promise.all([
        this.userServiceClient.getUsersStats({}, { metadata: attachMetadata(req) }),
        this.userServiceClient.getInstructorsStats({}, { metadata: attachMetadata(req) }),
        this.courseServiceClient.getCoursesStats({}, { metadata: attachMetadata(req) }),
        this.orderServiceClient.getRevenueStats({ range }, { metadata: attachMetadata(req) }),
      ]);
      // Properly map and sanitize the data
      const systemOverview: SystemOverview = {
        totalUsers: Number(userStats?.total) ?? 0,
        activeInstructors: Number(instructorStats?.active) ?? 0,
        totalCourses: Number(courseStats?.totalCourse) ?? 0,
        monthlyRevenue: Number(revenueStats?.revenueThisMonth) ?? 0,
      };

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success<SystemOverview>(
          systemOverview,
          ADMIN_MESSAGES.INSTRUCTORS_FETCH_SUCCESS?.message ?? 'System overview fetched successfully'
        );
    } catch (error) {
      this.logger.error('Error occurred in getSystemOverview', { error });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error('INTERNAL_SERVER_ERROR', 'An error occurred while fetching system overview');
    }
  }
  async getRevenuesStats(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'getRevenueStats'`);

    try {
      // Accept range from query params, fallback to 'thisMonth'
      const range: string = req.query.range?.toString() || 'thisMonth';

      const { success, error } = await this.orderServiceClient.getRevenueStats(
        { range },
        {
          metadata: attachMetadata(req),
        }
      );

      if (error || !success) {
        this.logger.warn("Failed to fetch revenue stats", { error });
        return new ResponseWrapper(res)
          .status(HttpStatus.NOT_FOUND)
          .error('NOT_FOUND', 'Revenue stats not found');
      }

      // Optionally validate the response structure here

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(success, 'Revenue stats fetched successfully');
    } catch (err) {
      this.logger.error('Error in getRevenueStats', { err });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error('INTERNAL_SERVER_ERROR', 'An error occurred while fetching revenue stats');
    }
  }
  async getRevenueStats(req: Request, res: Response): Promise<void> {
    this.logger.info(`Processing grpc method 'getRevenueStats'`);

    try {
      // Accept range from query params, fallback to 'thisMonth'
      const year: string = req.query.year?.toString() || '2026';

      const { success, error } = await this.enrollmentServiceClient.getRevenueStats(
        { year },
        {
          metadata: attachMetadata(req),
        }
      );

      if (error || !success) {
        this.logger.warn("Failed to fetch revenue stats", { error });
        return new ResponseWrapper(res)
          .status(HttpStatus.NOT_FOUND)
          .error('NOT_FOUND', 'Revenue stats not found');
      }

      // Optionally validate the response structure here

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(success, 'Revenue stats fetched successfully');
    } catch (err) {
      this.logger.error('Error in getRevenueStats', { err });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error('INTERNAL_SERVER_ERROR', 'An error occurred while fetching revenue stats');
    }
  }


}
