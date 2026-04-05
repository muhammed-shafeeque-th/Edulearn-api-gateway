import { Request, Response } from 'express';
import validateSchema from '../../../../services/security/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { Observe } from '@/services/observability/decorators';
import { getNotificationSchema } from '../schemas/get-notification.schema';
import { attachMetadata } from '../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { getNotificationsSchema } from '../schemas/get-notifications.schema';
import { markAsReadSchema } from '../schemas/mark-as-read.schema';
import { NotificationData } from '@/domains/service-clients/notification/proto/generated/notification';
import { markAllAsReadSchema } from '../schemas/mark-all-as-read.schema';
import { NOTIFICATION_MESSAGES } from '../utils/resposne-messages';
import { Notification } from '../types';
import { deleteNotificationSchema } from '../schemas/delete-notification.schema';
import { clearNotificationsSchema } from '../schemas/clear-notifications.schema';
import { NotificationResponseMapper } from '../utils/mappers';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/services/di';

@Observe({ logLevel: 'debug' })
@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService
  ) {
  }

  async getNotifications(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        params: req.query,
        ...req.user,
      },
      getNotificationsSchema
    )!;

    const { success } = await this.notificationService.getAllNotifications(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    const notifications = success?.notifications.map(
      NotificationResponseMapper.toNotification
    );

    const paginationResponse = mapPaginationResponse(
      {
        page: validPayload.params!.page,
        pageSize: validPayload.params!.pageSize,
      },
      success?.total
    );

    return new ResponseWrapper(res)
      .status(NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS.statusCode)
      .success(
        notifications,
        NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS.message,
        paginationResponse
      );
  }

  async getNotification(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getNotificationSchema
    )!;

    const { notification } = await this.notificationService.getNotification(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(NOTIFICATION_MESSAGES.FETCH_NOTIFICATION.statusCode)
      .success(
        NotificationResponseMapper.toNotification(notification!),
        NOTIFICATION_MESSAGES.FETCH_NOTIFICATION.message
      );
  }
  async deleteNotification(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      deleteNotificationSchema
    )!;

    const { success } = await this.notificationService.deleteNotification(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(NOTIFICATION_MESSAGES.DELETE_NOTIFICATION.statusCode)
      .success({});
  }

  async clearNotifications(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      clearNotificationsSchema
    )!;

    const { success } = await this.notificationService.clearUserNotifications(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(NOTIFICATION_MESSAGES.CLEAR_USER_NOTIFICATIONS.statusCode)
      .success({});
  }

  async markAllAsRead(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.query,
        ...req.user,
      },
      markAllAsReadSchema
    )!;

    const { success } = await this.notificationService.markAllAsRead(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(NOTIFICATION_MESSAGES.MARK_ALL_AS_READ.statusCode)
      .success(success, NOTIFICATION_MESSAGES.MARK_ALL_AS_READ.message);
  }

  async markAsRead(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      markAsReadSchema
    )!;

    const { success } = await this.notificationService.markAsRead(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(NOTIFICATION_MESSAGES.MARK_AS_READ.statusCode)
      .success({ success: true }, NOTIFICATION_MESSAGES.MARK_AS_READ.message);
  }
}
