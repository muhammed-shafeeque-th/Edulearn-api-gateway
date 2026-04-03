import { NotificationData } from "@/domains/service-clients/notification/proto/generated/notification";
import { Notification } from "../types";

export class NotificationResponseMapper {
  // Mapping Functions
  public static toNotification = (
    dto: NotificationData
  ): Notification | undefined => {
    if (!dto) return;
    return {
      actionUrl: dto.actionUrl,
      message: dto.body,
      createdAt: dto.createdAt,
      id: dto.id,
      isRead: dto.isRead,
      metadata: dto.metadata,
      category: dto.category,
      priority: dto.priority,
      recipient: dto.recipient,
      subject: dto.subject,
      type: dto.type,
      userId: dto.userId,
    };
  };
}
