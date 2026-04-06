import { Request, Response } from 'express';
import validateSchema from '../../../../services/security/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';

import { NotificationService } from '../../../service-clients/notification';
import { blockUserSchema } from '../schemas/block-user.schema';
import { updateUserSchema } from '../schemas/update-user.schema';
import { unBlockUserSchema } from '../schemas/unblock-user.schema';
import { detailedUserSchema } from '../schemas/get-user.schema';
import { LoggingService } from 'services/observability/logging/logging.service';
import { HttpStatus } from '@/shared/constants/http-status';
import { attachMetadata } from '../utils/attach-metadata';
import { Observe } from '@/services/observability/decorators';
import { AccountAccessService } from '@/services/account-access.service';
import { CourseService } from '@/domains/service-clients/course';
import { OrderService } from '@/domains/service-clients/order';
import { AuthService } from '@/domains/service-clients/auth';
import { adminLoginSchema } from '../schemas/admin-login.schema';
import { adminRefreshSchema } from '../schemas/admin-refresh.schema';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { getUsersSchema } from '@/domains/user/v1/schemas/user/get-users.schema';
import { USER_MESSAGES } from '@/domains/user/v1/utils/user/user-resposne-messages';
import { UserService } from '@/domains/service-clients/user';
import { attachAdminCookies, clearAdminCookies } from '../utils/manage-cookies';
import { getInstructorsSchema } from '@/domains/user/v1/schemas/user/get-instructors.schema';
import { ADMIN_MESSAGES } from '../utils/resposne-messages';
import { adminRefreshToken } from '../utils/constants';
import { UserResponseMapper } from '@/domains/user/v1/utils/user/user.mappers';
import { EnrollmentService } from '@/domains/service-clients/enrollment';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/services/di';
import { unBlockInstructorSchema } from '../schemas/unblock-instructor.schema';
import { blockInstructorSchema } from '../schemas/block-instructor.schema';
import { config } from '@/config';

@injectable()
@Observe({ logLevel: config.observability.logger.logLevel as 'debug' })
export class AdminController {
  constructor(
    @inject(TYPES.LoggingService) private logger: LoggingService,
    @inject(TYPES.UserService) private userServiceClient: UserService,
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
    @inject(TYPES.CourseService)
    private readonly courseServiceClient: CourseService,
    @inject(TYPES.EnrollmentService)
    private readonly enrollmentServiceClient: EnrollmentService,
    @inject(TYPES.OrderService)
    private readonly orderServiceClient: OrderService,
    @inject(TYPES.AuthService) private readonly authServiceClient: AuthService,
    @inject(TYPES.NotificationService)
    private readonly notificationServiceClient: NotificationService,
    @inject(TYPES.AccountAccessService)
    private readonly accountAccessService: AccountAccessService
  ) {}

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
    this.logger.debug(`Processing grpc method 'adminRefresh'`);
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

  async blockAccount(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'blockAccount'`);
    const validPayload = validateSchema({ ...req.params }, blockUserSchema)!;

    const serverResponse = await this.userServiceClient.blockAccount(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );
    await this.accountAccessService.blockAccount(validPayload.userId);

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_BLOCK_SUCCESS.statusCode)
      .success(
        serverResponse.success,
        ADMIN_MESSAGES.USER_BLOCK_SUCCESS.message
      );
  }

  async unblockAccount(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'unblockAccount'`);
    const validPayload = validateSchema({ ...req.params }, unBlockUserSchema)!;

    const { success } = await this.userServiceClient.unBlockAccount(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    )!;
    await this.accountAccessService.unblockAccount(validPayload.userId);

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_UNBLOCK_SUCCESS.statusCode)
      .success(success, ADMIN_MESSAGES.USER_UNBLOCK_SUCCESS.message);
  }

  async blockInstructor(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'blockInstructor'`);
    const validPayload = validateSchema(
      { ...req.params },
      blockInstructorSchema
    )!;

    const serverResponse = await this.userServiceClient.blockInstructor(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );
    // Sync Redis for immediate role-specific revocation
    await this.accountAccessService.blockUserRole(
      req.params.instructorId as string,
      'instructor'
    );

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_BLOCK_SUCCESS.statusCode)
      .success(serverResponse.success, 'Instructor role blocked successfully');
  }

  async unblockInstructor(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'unblockInstructor'`);
    const validParams = validateSchema(
      { ...req.params },
      unBlockInstructorSchema
    )!;

    const { success } = await this.userServiceClient.unBlockInstructor(
      validParams,
      {
        metadata: attachMetadata(req),
      }
    )!;
    await this.accountAccessService.unblockUserRole(
      req.params.instructorId as string,
      'instructor'
    );

    return new ResponseWrapper(res)
      .status(ADMIN_MESSAGES.USER_UNBLOCK_SUCCESS.statusCode)
      .success(success, 'Instructor role unblocked successfully');
  }

  async getUser(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'getUser'`);
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
    this.logger.debug(`Processing grpc method 'getUsers'`);

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
    this.logger.debug(`Processing grpc method 'getAllInstructors'`);

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
        instructors?.instructors.map(UserResponseMapper.toInstructorMetadata) ??
          [],
        ADMIN_MESSAGES.INSTRUCTORS_FETCH_SUCCESS.message,
        paginationResponse
      );
  }

  async updateUserData(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'updateUserData'`);
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
    this.logger.debug("Processing grpc method 'getSystemOverview'");

    type SystemOverview = {
      totalUsers: number;
      activeInstructors: number;
      totalCourses: number;
      monthlyRevenue: number;
    };

    try {
      const year = parseInt(
        req.query.year?.toString() || new Date().getFullYear().toString()
      );

      const [
        { success: userStats },
        { success: instructorStats },
        { success: courseStats },
        { success: revenueStats },
      ] = await Promise.all([
        this.userServiceClient.getUsersStats(
          {},
          { metadata: attachMetadata(req) }
        ),
        this.userServiceClient.getInstructorsStats(
          {},
          { metadata: attachMetadata(req) }
        ),
        this.courseServiceClient.getCoursesStats(
          {},
          { metadata: attachMetadata(req) }
        ),
        this.orderServiceClient.getRevenueStats(
          { year },
          { metadata: attachMetadata(req) }
        ),
      ]);

      const thisMonth = new Date().getMonth();

      const systemOverview: SystemOverview = {
        totalUsers: Number(userStats?.total) ?? 0,
        activeInstructors: Number(instructorStats?.active) ?? 0,
        totalCourses: Number(courseStats?.totalCourses) ?? 0,
        monthlyRevenue:
          Number(
            revenueStats?.revenueStats?.find(state => state.month === thisMonth)
          ) ?? 0,
      };

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success<SystemOverview>(
          systemOverview,
          ADMIN_MESSAGES.INSTRUCTORS_FETCH_SUCCESS?.message ??
            'System overview fetched successfully'
        );
    } catch (error) {
      this.logger.error('Error occurred in getSystemOverview', { error });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error(
          'INTERNAL_SERVER_ERROR',
          'An error occurred while fetching system overview'
        );
    }
  }
  async getRevenuesStats(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'getRevenuesStats'`);

    try {
      const year = parseInt(
        req.query.year?.toString() || new Date().getFullYear().toString()
      );

      const { success } = await this.orderServiceClient.getRevenueStats(
        { year },
        {
          metadata: attachMetadata(req),
        }
      );

      console.log('Review stats : ' + JSON.stringify(success, null, 2));

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(success?.revenueStats, 'Revenue stats fetched successfully');
    } catch (err) {
      this.logger.error('Error in getRevenueStats', { err });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error(
          'INTERNAL_SERVER_ERROR',
          'An error occurred while fetching revenue stats'
        );
    }
  }
  async getEnrollmentTrend(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'getEnrollmentTrend'`);

    try {
      const year = parseInt(
        req.query.year?.toString() || new Date().getFullYear().toString()
      );

      const { success } = await this.enrollmentServiceClient.getEnrollmentTrend(
        { year },
        {
          metadata: attachMetadata(req),
        }
      );

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(success?.trend, 'Enrollment stats fetched successfully');
    } catch (err) {
      this.logger.error('Error in getEnrollmentTrend', { err });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error(
          'INTERNAL_SERVER_ERROR',
          'An error occurred while fetching revenue stats'
        );
    }
  }
  // async getRevenueStats(req: Request, res: Response): Promise<void> {
  //   this.logger.debug(`Processing grpc method 'getRevenueStats'`);

  //   try {
  //     // Accept range from query params, fallback to 'thisMonth'
  //     const year: string = req.query.year?.toString() || '2026';

  //     const { success, error } =
  //       await this.enrollmentServiceClient.getRevenueStats(
  //         { year },
  //         {
  //           metadata: attachMetadata(req),
  //         }
  //       );

  //     return new ResponseWrapper(res)
  //       .status(HttpStatus.OK)
  //       .success(success, 'Revenue stats fetched successfully');
  //   } catch (err) {
  //     this.logger.error('Error in getRevenueStats', { err });
  //     return new ResponseWrapper(res)
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .error(
  //         'INTERNAL_SERVER_ERROR',
  //         'An error occurred while fetching revenue stats'
  //       );
  //   }
  // }

  async getUserGrowthTrend(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'getUserGrowthTrend'`);

    try {
      const year = parseInt(
        req.query.year?.toString() || new Date().getFullYear().toString()
      );

      const { success } = await this.userServiceClient.getUsersGrowthTrend(
        { year },
        {
          metadata: attachMetadata(req),
        }
      );

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(success, 'User growth trend fetched successfully');
    } catch (err) {
      this.logger.error('Error in getUserGrowthTrend', { err });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error(
          'INTERNAL_SERVER_ERROR',
          'An error occurred while fetching user growth trend'
        );
    }
  }

  async getInstructorGrowthTrend(req: Request, res: Response): Promise<void> {
    this.logger.debug(`Processing grpc method 'getInstructorGrowthTrend'`);

    try {
      const year = parseInt(
        req.query.year?.toString() || new Date().getFullYear().toString()
      );

      const { success } =
        await this.userServiceClient.getInstructorsGrowthTrend(
          { year },
          {
            metadata: attachMetadata(req),
          }
        );

      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(success, 'Instructor growth trend fetched successfully');
    } catch (err) {
      this.logger.error('Error in getInstructorGrowthTrend', { err });
      return new ResponseWrapper(res)
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .error(
          'INTERNAL_SERVER_ERROR',
          'An error occurred while fetching instructor growth trend'
        );
    }
  }
}
