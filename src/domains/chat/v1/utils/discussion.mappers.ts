import {
  DiscussionMessageData,
  DiscussionRoomData,
  MessageData,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { Discussion, DiscussionMessage, Message } from '../types';
import { UserInfo } from '@/domains/user/v1/types';

export class DiscussionResponseMapper {
  public static toDiscussion = (chat: DiscussionRoomData): Discussion => {
    return {
      id: chat.id,
      instructorId: chat.instructorId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      courseId: chat.courseId,
    };
  };

  public static toDiscussionMessage = (
    message: DiscussionMessageData,
    sender?: UserInfo
  ): DiscussionMessage => {
    return {
      id: message.id,
      roomId: message.roomId,
      senderRole: message.senderRole,
      sender: sender,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sequence: message.sequence,
    };
  };
}
