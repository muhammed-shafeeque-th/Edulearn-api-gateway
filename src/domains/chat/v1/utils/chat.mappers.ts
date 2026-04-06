import {
  ChatData,
  MessageData,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { Chat, Message } from '../types';
import { UserInfo } from '@/domains/user/v1/types';

export class ChatResponseMapper {
  public static toChat = (chat: ChatData, user?: UserInfo): Chat => {
    return {
      id: chat.id,
      studentId: chat.studentId,
      instructorId: chat.instructorId,
      lastMessageId: chat.lastMessageId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      isPinned: chat.isPinned,
      isArchived: chat.isArchived,
      isMuted: chat.isMuted,

      otherUser: user,
    };
  };

  public static toMessage = (message: MessageData): Message => {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sequence: message.sequence,
      reactions: message.reactions,
      ...('editedAt' in message && message.editedAt
        ? { editedAt: (message as MessageData & { editedAt: string }).editedAt }
        : {}),
    };
  };
}
