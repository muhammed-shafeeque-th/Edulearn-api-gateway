import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  ClearUserNotificationsRequest,
  ClearUserNotificationsResponse,
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  ForgotPasswordRequest,
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetNotificationRequest,
  GetNotificationResponse,
  MarkAllNotificationsRequest,
  MarkNotificationRequest,
  NotificationResponse,
  NotificationServiceClient,
  OTPRequest,
  VerifyOTPRequest,
} from './proto/generated/notification';
import { config } from 'config';
import { ForgotPasswordResponse } from '../auth/proto/generated/auth_service';

export class NotificationService {
  private readonly client: GrpcClient<NotificationServiceClient>;
  private static instance: NotificationService;

  private constructor() {
    const [host = 'localhost', port = '50054'] =
      config.grpc.services.notificationService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'notification',
        'notification.proto'
      ),
      packageName: 'notification',
      serviceName: 'NotificationService',
      host,
      port: parseInt(port),
    });
  }

  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendOtp(
    request: OTPRequest,
    options: GrpcClientOptions = {}
  ): Promise<NotificationResponse> {
    const response = await this.client.unaryCall('sendOtp', request, options);
    return response as NotificationResponse;
  }

  async verifyOtp(
    request: VerifyOTPRequest,
    options: GrpcClientOptions = {}
  ): Promise<NotificationResponse> {
    const response = await this.client.unaryCall('verifyOtp', request, options);
    return response as NotificationResponse;
  }

  async getAllNotifications(
    request: GetNotificationsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetNotificationsResponse> {
    const response = await this.client.unaryCall(
      'getNotifications',
      request,
      options
    );
    return response as GetNotificationsResponse;
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
    options: GrpcClientOptions = {}
  ): Promise<ForgotPasswordResponse> {
    const response = await this.client.unaryCall(
      'forgotPassword',
      request,
      options
    );
    return response as ForgotPasswordResponse;
  }

  async getNotification(
    request: GetNotificationRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetNotificationResponse> {
    const response = await this.client.unaryCall(
      'getNotification',
      request,
      options
    );
    return response as GetNotificationResponse;
  }
  async deleteNotification(
    request: DeleteNotificationRequest,
    options: GrpcClientOptions = {}
  ): Promise<DeleteNotificationResponse> {
    const response = await this.client.unaryCall(
      'deleteNotification',
      request,
      options
    );
    return response as DeleteNotificationResponse;
  }
  async clearUserNotifications(
    request: ClearUserNotificationsRequest,
    options: GrpcClientOptions = {}
  ): Promise<ClearUserNotificationsResponse> {
    const response = await this.client.unaryCall(
      'clearUserNotifications',
      request,
      options
    );
    return response as ClearUserNotificationsResponse;
  }

  async markAllAsRead(
    request: MarkAllNotificationsRequest,
    options: GrpcClientOptions = {}
  ): Promise<NotificationResponse> {
    const response = await this.client.unaryCall(
      'markAllAsRead',
      request,
      options
    );
    return response as NotificationResponse;
  }

  async markAsRead(
    request: MarkNotificationRequest,
    options: GrpcClientOptions = {}
  ): Promise<NotificationResponse> {
    const response = await this.client.unaryCall(
      'markAsRead',
      request,
      options
    );
    return response as NotificationResponse;
  }

  close() {
    this.client.close();
  }
}
