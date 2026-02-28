import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { config } from '@/config';
import { UserServiceClient } from './proto/generated/user_service';
import {
  BlockUserRequest,
  BlockUserResponse,
  CheckUserByEmailRequest,
  CheckUserByEmailResponse,
  GetCurrentUserRequest,
  GetCurrentUserResponse,
  GetUserEmailsRequest,
  GetUserEmailsResponse,
  GetUserRequest,
  GetUserResponse,
  ListUsersByIdsRequest,
  ListUsersResponse,
  ListUsersRequest,
  UnBlockUserRequest,
  UnBlockUserResponse,
  UpdateUserDetailsRequest,
  UpdateUserDetailsResponse,
} from './proto/generated/user/types/user_types';
import {
  GetInstructorsRequest,
  ListInstructorsResponse,
  RegisterInstructorRequest,
  RegisterInstructorResponse,
} from './proto/generated/user/types/instructor_types';
import {
  ListInstructorsOfStudentRequest,
  ListStudentsOfInstructorRequest,
} from './proto/generated/user/types/instructor_student';
import { Empty } from './proto/generated/user/common';
import {
  GetInstructorsGrowthTrendRequest,
  GetInstructorsGrowthTrendResponse,
  GetInstructorsStatsResponse,
  GetUsersGrowthTrendRequest,
  GetUsersGrowthTrendResponse,
  GetUsersStatsResponse,
} from './proto/generated/user/types/stats_types';

import { injectable } from 'inversify';

@injectable()
export class UserService {
  private readonly client: GrpcClient<UserServiceClient>;
  private static instance: UserService;

  public constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.userServiceClient.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'user',
        'user_service.proto'
      ),
      packageName: 'user_service',
      serviceName: 'UserService',
      host,
      port: parseInt(port),
      loaderOptions: {
        includeDirs: [path.join(process.cwd(), 'proto', 'user')],
      },
    });
  }

  /**
   * @deprecated Use DI container instead
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public static async shutdown(): Promise<void> {
    if (UserService.instance) {
      try {
        UserService.instance.close();
      } finally {
        // no-op
      }
    }
  }

  async registerInstructor(
    request: RegisterInstructorRequest,
    options: GrpcClientOptions = {}
  ): Promise<RegisterInstructorResponse> {
    const response = await this.client.unaryCall(
      'registerInstructor',
      request,
      options
    );
    return response as RegisterInstructorResponse;
  }

  async listInstructors(
    request: GetInstructorsRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListInstructorsResponse> {
    const response = await this.client.unaryCall(
      'listInstructors',
      request,
      options
    );
    return response as ListInstructorsResponse;
  }

  async checkUserEmailExists(
    request: CheckUserByEmailRequest,
    options: GrpcClientOptions = {}
  ): Promise<CheckUserByEmailResponse> {
    const response = await this.client.unaryCall(
      'checkUserEmailExist',
      request,
      options
    );
    return response as CheckUserByEmailResponse;
  }

  async getUserEmails(
    request: GetUserEmailsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUserEmailsResponse> {
    const response = await this.client.unaryCall(
      'getUserEmails',
      request,
      options
    );
    return response as GetUserEmailsResponse;
  }

  async getUser(
    request: GetUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUserResponse> {
    const response = await this.client.unaryCall('getUser', request, options);
    return response as GetUserResponse;
  }

  async updateUserDetails(
    request: UpdateUserDetailsRequest,
    options: GrpcClientOptions = {}
  ): Promise<UpdateUserDetailsResponse> {
    const response = await this.client.unaryCall(
      'updateUserDetails',
      request,
      options
    );
    return response as UpdateUserDetailsResponse;
  }

  async blockUser(
    request: BlockUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<BlockUserResponse> {
    const response = await this.client.unaryCall('blockUser', request, options);
    return response as BlockUserResponse;
  }
  async unBlockUser(
    request: UnBlockUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<UnBlockUserResponse> {
    const response = await this.client.unaryCall(
      'unBlockUser',
      request,
      options
    );
    return response as UnBlockUserResponse;
  }

  async getCurrentUser(
    request: GetCurrentUserRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetCurrentUserResponse> {
    const response = await this.client.unaryCall(
      'getCurrentUser',
      request,
      options
    );
    return response as GetCurrentUserResponse;
  }

  async listUsers(
    request: ListUsersRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListUsersResponse> {
    const response = await this.client.unaryCall('listUsers', request, options);
    return response as ListUsersResponse;
  }
  async listUsersByIds(
    request: ListUsersByIdsRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListUsersResponse> {
    const response = await this.client.unaryCall(
      'listUsersByIds',
      request,
      options
    );
    return response as ListUsersResponse;
  }

  // Instructor User relation methods
  async listInstructorsOfStudent(
    request: ListInstructorsOfStudentRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListInstructorsResponse> {
    const response = await this.client.unaryCall(
      'listInstructorsOfStudent',
      request,
      options
    );
    return response as ListInstructorsResponse;
  }
  async listStudentsOfInstructor(
    request: ListStudentsOfInstructorRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListUsersResponse> {
    const response = await this.client.unaryCall(
      'listStudentsOfInstructor',
      request,
      options
    );
    return response as ListUsersResponse;
  }

  // Stats
  async getUsersStats(
    request: Empty,
    options: GrpcClientOptions = {}
  ): Promise<GetUsersStatsResponse> {
    const response = await this.client.unaryCall(
      'getUsersStats',
      request,
      options
    );
    return response as GetUsersStatsResponse;
  }
  async getInstructorsStats(
    request: Empty,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorsStatsResponse> {
    const response = await this.client.unaryCall(
      'getInstructorsStats',
      request,
      options
    );
    return response as GetInstructorsStatsResponse;
  }
  async getInstructorsGrowthTrend(
    request: GetInstructorsGrowthTrendRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorsGrowthTrendResponse> {
    const response = await this.client.unaryCall(
      'getInstructorsGrowthTrend',
      request,
      options
    );
    return response as GetInstructorsGrowthTrendResponse;
  }
  async getUsersGrowthTrend(
    request: GetUsersGrowthTrendRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUsersGrowthTrendResponse> {
    const response = await this.client.unaryCall(
      'getUsersGrowthTrend',
      request,
      options
    );
    return response as GetUsersGrowthTrendResponse;
  }

  close() {
    this.client.close();
  }
}
