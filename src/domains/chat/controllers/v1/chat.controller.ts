import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { Observe } from '@/services/observability/decorators';
import { createChatSchema } from '../../schemas/chats/create-chat.schema';
import { Chat, Message } from '../../types';
import { attachMetadata } from '../../utils/attach-metadata';
import {
  mapPaginationResponse,
  PaginationLike,
} from '@/shared/utils/map-pagination';
import { ChatService } from '@/domains/service-clients/chat';
import { getChatSchema } from '../../schemas/chats/get-chat.schema';
import { pinChatSchema } from '../../schemas/chats/pin-chat.schema';
import { unPinChatSchema } from '../../schemas/chats/unpin-chat.schema';
import { deleteChatSchema } from '../../schemas/chats/delete-chat.schema';
import { unArchiveChatSchema } from '../../schemas/chats/unarchive-chat.schema';
import { archiveChatSchema } from '../../schemas/chats/archive-chat.schema';
import { sendMessagesSchema } from '../../schemas/chats/send-message.schema';
import { editMessagesSchema } from '../../schemas/chats/edit-message.schema';
import { markMessageReadSchema } from '../../schemas/chats/mark-message-read.schema';
import { deleteMessagesSchema } from '../../schemas/chats/delete-message.schema';
import { removeReactionSchema } from '../../schemas/chats/remove-reaction.schema';
import { addReactionSchema } from '../../schemas/chats/add-reaction.schema';
import { getInstructorChatsSchema } from '../../schemas/chats/get-instructor-chats.schema';
import {
  ChatResponse,
  ChatsListResponse,
  ChatsResponse,
  MessageResponse,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { CHAT_MESSAGES } from '../../utils/resposne-messages';
import { getMessagesSchema } from '../../schemas/chats/get-messages.schema';
import { ChatResponseMapper } from '../../utils/chat.mappers';
import { UserResponseMapper } from '@/domains/user/utils/mappers';
import { UserInfo } from '@/domains/user/types';
import { getStudentChatsSchema } from '../../schemas/chats/get-student-chats.schema';
import { USER_ROLE } from '@/shared/types/user-types';
import { TYPES } from '@/services/di';
import { inject, injectable } from 'inversify';

@Observe({ logLevel: 'debug' })
@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.UserService) private userServiceClient: UserService,
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
    @inject(TYPES.ChatService) private chatServiceClient: ChatService
  ) {}

  async createOrGetChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      createChatSchema
    )!;

    const otherUserId = this.getOtherUserId(validPayload, req);

    const [{ chat }, userRes] = await Promise.all([
      this.chatServiceClient.createOrGetChat(validPayload, {
        metadata: attachMetadata(req),
      }),
      this.userServiceClient
        .getUser({ userId: otherUserId }, { metadata: attachMetadata(req) })
        .catch(() => null),
    ]);

    const user = userRes?.user
      ? UserResponseMapper.toUserInfo(userRes.user)
      : undefined;

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.CREATE_CONVERSATION_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toChat(chat!, user),
        CHAT_MESSAGES.CREATE_CONVERSATION_SUCCESS.message
      );
  }

  async getChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getChatSchema
    )!;

    const { chat } = await this.chatServiceClient.getChat(validPayload, {
      metadata: attachMetadata(req),
    });
    const mappedChat = ChatResponseMapper.toChat(chat!);

    const otherUserId = this.getOtherUserId(mappedChat, req);

    const { user } = await this.userServiceClient.getUser({
      userId: otherUserId,
    });

    const userInfo = UserResponseMapper.toUserInfo(user!);

    const chatWithUser: Chat = {
      ...mappedChat,
      otherUser: userInfo,
    };

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.GET_CONVERSATION_SUCCESS.statusCode)
      .success(chatWithUser, CHAT_MESSAGES.GET_CONVERSATION_SUCCESS.message);
  }

  async getChats(req: Request, res: Response) {
    const userRole = req.query?.role as USER_ROLE | undefined;
    const isInstructor =
      userRole === 'instructor' && req.user?.role === 'instructor';

    let chats: ChatsResponse | undefined;
    let pagination: PaginationLike;

    if (isInstructor) {
      const validPayload = validateSchema(
        {
          pagination: req.query,
          instructorId: req.user?.userId,
        },
        getInstructorChatsSchema
      )!;

      const { chats: chatsRes } =
        await this.chatServiceClient.listInstructorChats(validPayload, {
          metadata: attachMetadata(req),
        });

      chats = chatsRes;
      pagination = validPayload.pagination!;
    } else {
      const validPayload = validateSchema(
        {
          pagination: req.query,
          studentId: req.user?.userId,
        },
        getStudentChatsSchema
      )!;

      const { chats: chatsRes } = await this.chatServiceClient.listStudentChats(
        validPayload,
        {
          metadata: attachMetadata(req),
        }
      );

      chats = chatsRes;
      pagination = validPayload.pagination!;
    }

    const mappedChats = chats?.chats.map(c => ChatResponseMapper.toChat(c));

    const paginationResponse = mapPaginationResponse(pagination!, chats?.total);
    if (!mappedChats || mappedChats.length === 0) {
      return new ResponseWrapper(res)
        .status(CHAT_MESSAGES.GET_USER_CONVERSATIONS_SUCCESS.statusCode)
        .success(
          [],
          CHAT_MESSAGES.GET_USER_CONVERSATIONS_SUCCESS.message,
          paginationResponse
        );
    }

    const userIds = Array.from(
      new Set(mappedChats?.map(c => this.getOtherUserId(c, req)))
    );

    // Batch fetching of user with list of userIds
    const { users: usersResponse } =
      await this.userServiceClient.listUsersByIds({
        userIds,
      });

    const userMap = usersResponse?.users?.reduce(
      (accMap, user) => {
        accMap[user.id] = UserResponseMapper.toUserInfo(user);
        return accMap;
      },
      {} as Record<string, UserInfo>
    )!;

    const chatsWithUser = mappedChats.map<Chat>(chat => {
      const otherUserId = this.getOtherUserId(chat, req);
      return {
        ...chat,
        otherUser: userMap[otherUserId],
      };
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.GET_USER_CONVERSATIONS_SUCCESS.statusCode)
      .success<
        Chat[]
      >(chatsWithUser, CHAT_MESSAGES.GET_USER_CONVERSATIONS_SUCCESS.message, paginationResponse);
  }

  async pinChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      pinChatSchema
    )!;

    const { chat } = await this.chatServiceClient.pinChat(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.PIN_CONVERSATION_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toChat(chat!),
        CHAT_MESSAGES.PIN_CONVERSATION_SUCCESS.message
      );
  }

  async unPinChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      unPinChatSchema
    )!;

    const { chat } = await this.chatServiceClient.unPinChat(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.UNPIN_CONVERSATION_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toChat(chat!),
        CHAT_MESSAGES.UNPIN_CONVERSATION_SUCCESS.message
      );
  }

  async deleteChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      deleteChatSchema
    )!;

    await this.chatServiceClient.deleteChat(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.DELETE_CONVERSATION_SUCCESS.statusCode)
      .success({}, CHAT_MESSAGES.DELETE_CONVERSATION_SUCCESS.message);
  }

  async archiveChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      archiveChatSchema
    )!;

    const { chat } = await this.chatServiceClient.archiveChat(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.ARCHIVE_CONVERSATION_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toChat(chat!),
        CHAT_MESSAGES.ARCHIVE_CONVERSATION_SUCCESS.message
      );
  }

  async unArchiveChat(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      unArchiveChatSchema
    )!;

    await this.chatServiceClient.unArchiveChat(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.UNARCHIVE_CONVERSATION_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.UNARCHIVE_CONVERSATION_SUCCESS.message);
  }

  async getMessages(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        pagination: req.query,
        ...req.params,
        ...req.user,
      },
      getMessagesSchema
    )!;

    const { messages } = await this.chatServiceClient.getMessages(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      messages?.total
    );

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.GET_MESSAGES_SUCCESS.statusCode)
      .success(
        Array.isArray(messages?.messages)
          ? messages?.messages.map(ChatResponseMapper.toMessage)
          : [],
        CHAT_MESSAGES.GET_MESSAGES_SUCCESS.message,
        paginationResponse
      );
  }

  async sendMessage(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        idempotencyKey:
          req.headers['idempotency-key'] ?? req.headers['x-request-id'],
        senderId: req.user?.userId,
      },
      sendMessagesSchema
    )!;

    const { message } = await this.chatServiceClient.sendMessage(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.SEND_MESSAGE_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toMessage(message!),
        CHAT_MESSAGES.SEND_MESSAGE_SUCCESS.message
      );
  }

  async editMessage(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      editMessagesSchema
    )!;

    const { message } = await this.chatServiceClient.editMessage(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.EDIT_MESSAGE_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toMessage(message!),
        CHAT_MESSAGES.EDIT_MESSAGE_SUCCESS.message
      );
  }

  async markMessagesRead(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      markMessageReadSchema
    )!;

    const { chat } = await this.chatServiceClient.markMessagesRead(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.MARK_MESSAGES_READ_SUCCESS.statusCode)
      .success(chat, CHAT_MESSAGES.MARK_MESSAGES_READ_SUCCESS.message);
  }

  async deleteMessage(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.query,
        ...req.params,
        ...req.user,
      },
      deleteMessagesSchema
    )!;

    await this.chatServiceClient.deleteMessage(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.DELETE_MESSAGE_SUCCESS.statusCode)
      .success({}, CHAT_MESSAGES.DELETE_MESSAGE_SUCCESS.message);
  }

  async removeReaction(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      removeReactionSchema
    )!;

    const { message } = await this.chatServiceClient.removeReaction(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.REMOVE_REACTION_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toMessage(message!),
        CHAT_MESSAGES.REMOVE_REACTION_SUCCESS.message
      );
  }

  async reactMessage(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      addReactionSchema
    )!;

    const { message } = await this.chatServiceClient.addReaction(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.ADD_REACTION_SUCCESS.statusCode)
      .success(
        ChatResponseMapper.toMessage(message!),
        CHAT_MESSAGES.ADD_REACTION_SUCCESS.message
      );
  }

  private getOtherUserId = <
    T extends { studentId: string; instructorId: string },
  >(
    chatType: T,
    req: any
  ): string => {
    return req.user?.userId === chatType.studentId
      ? chatType.instructorId
      : chatType.studentId;
  };
}
