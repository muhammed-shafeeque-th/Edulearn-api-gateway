import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { Observe } from '@/services/observability/decorators';
import { createConversationSchema } from '../../schemas/create-conversation.schema';
import { Conversation, Message } from '../../types';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { ChatService } from '@/domains/service-clients/chat';
import { getConversationSchema } from '../../schemas/get-conversation.schema';
import { pinConversationSchema } from '../../schemas/pin-conversation.schema';
import { unPinConversationSchema } from '../../schemas/unpin-conversation.schema';
import { deleteConversationSchema } from '../../schemas/delete-conversation.schema';
import { unArchiveConversationSchema } from '../../schemas/unarchive-conversation.schema';
import { archiveConversationSchema } from '../../schemas/archive-conversation.schema';
import { sendMessagesSchema } from '../../schemas/send-message.schema';
import { editMessagesSchema } from '../../schemas/edit-message.schema';
import { markMessageReadSchema } from '../../schemas/mark-message-read.schema';
import { deleteMessagesSchema } from '../../schemas/delete-message.schema';
import { removeReactionSchema } from '../../schemas/remove-reaction.schema';
import { addReactionSchema } from '../../schemas/add-reaction.schema';
import { getConversationsSchema } from '../../schemas/get-conversations.schema';
import {
  ConversationResponse,
  MessageResponse,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { CHAT_MESSAGES } from '../../utils/resposne-messages';
import { getMessagesSchema } from '../../schemas/get-messages.schema';

@Observe({ logLevel: 'debug' })
export class ChatController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private chatServiceClient: ChatService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.chatServiceClient = ChatService.getInstance();
  }

  async createConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      createConversationSchema
    )!;

    const result = await this.chatServiceClient.createConversation(
      validPayload,
      { attachMetadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.CREATE_CONVERSATION_SUCCESS.statusCode)
      .success(
        this.mapToConversation(result.conversation!),
        CHAT_MESSAGES.CREATE_CONVERSATION_SUCCESS.message
      );
  }

  async getConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getConversationSchema
    )!;

    const result = await this.chatServiceClient.getConversation(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.GET_CONVERSATION_SUCCESS.statusCode)
      .success(
        this.mapToConversation(result.conversation!),
        CHAT_MESSAGES.GET_CONVERSATION_SUCCESS.message
      );
  }

  async getUserConversations(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        pagination: req.query,
        ...req.params,
        ...req.user,
      },
      getConversationsSchema
    )!;

    const result = await this.chatServiceClient.listUserConversations(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );
    const paginationResponse = mapPaginationResponse(
      validPayload.pagination!,
      result?.total
    );

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.GET_USER_CONVERSATIONS_SUCCESS.statusCode)
      .success(
        result.conversations.map(this.mapToConversation),
        CHAT_MESSAGES.GET_USER_CONVERSATIONS_SUCCESS.message,
        paginationResponse
      );
  }

  async pinConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      pinConversationSchema
    )!;

    await this.chatServiceClient.pinConversation(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.PIN_CONVERSATION_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.PIN_CONVERSATION_SUCCESS.message);
  }

  async unPinConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      unPinConversationSchema
    )!;

    await this.chatServiceClient.unPinConversation(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.UNPIN_CONVERSATION_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.UNPIN_CONVERSATION_SUCCESS.message);
  }

  async deleteConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      deleteConversationSchema
    )!;

    await this.chatServiceClient.deleteConversation(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.DELETE_CONVERSATION_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.DELETE_CONVERSATION_SUCCESS.message);
  }

  async archiveConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      archiveConversationSchema
    )!;

    await this.chatServiceClient.archiveConversation(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.ARCHIVE_CONVERSATION_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.ARCHIVE_CONVERSATION_SUCCESS.message);
  }

  async unArchiveConversation(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      unArchiveConversationSchema
    )!;

    await this.chatServiceClient.unArchiveConversation(validPayload, {
      attachMetadata: attachMetadata(req),
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

    const result = await this.chatServiceClient.getMessages(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.GET_MESSAGES_SUCCESS.statusCode)
      .success(
        Array.isArray(result?.messages)
          ? result.messages.map(this.mapToMessage)
          : [],
        CHAT_MESSAGES.GET_MESSAGES_SUCCESS.message
      );
  }

  async sendMessage(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        senderId: req.user?.userId,
      },
      sendMessagesSchema
    )!;

    const result = await this.chatServiceClient.sendMessage(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.SEND_MESSAGE_SUCCESS.statusCode)
      .success(
        this.mapToMessage(result.message!),
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

    const result = await this.chatServiceClient.editMessage(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.EDIT_MESSAGE_SUCCESS.statusCode)
      .success(
        this.mapToMessage(result.messages!),
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

    await this.chatServiceClient.markMessagesRead(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.MARK_MESSAGES_READ_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.MARK_MESSAGES_READ_SUCCESS.message);
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
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.DELETE_MESSAGE_SUCCESS.statusCode)
      .success(null, CHAT_MESSAGES.DELETE_MESSAGE_SUCCESS.message);
  }

  async removeReaction(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      removeReactionSchema
    )!;

    const result = await this.chatServiceClient.removeReaction(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.REMOVE_REACTION_SUCCESS.statusCode)
      .success({}, CHAT_MESSAGES.REMOVE_REACTION_SUCCESS.message);
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

    const result = await this.chatServiceClient.addReaction(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CHAT_MESSAGES.ADD_REACTION_SUCCESS.statusCode)
      .success(
        this.mapToMessage(result),
        CHAT_MESSAGES.ADD_REACTION_SUCCESS.message
      );
  }

  // Mapping Functions
  private mapToConversation = <T extends ConversationResponse>(
    conversation: T
  ): Conversation => {
    return {
      createdAt: conversation.createdAt,
      id: conversation.id,
      isArchived: conversation.isArchived,
      isMuted: conversation.isMuted,
      isPinned: conversation.isPinned,
      mutedUntil: conversation.mutedUntil,
      participants: conversation.participants,
      studentId: conversation.studentId,
      type: conversation.type,
      updatedAt: conversation.updatedAt,
    };
  };

  private mapToMessage = <T extends MessageResponse>(message: T): Message => {
    return {
      content: message.content,
      conversationId: message.conversationId,
      createdAt: message.createdAt,
      id: message.id,
      reactions: message.reactions,
      senderId: message.senderId,
      status: message.status,
      updatedAt: message.updatedAt,
      fileName: message.fileName,
      fileSize: message.fileSize,
      fileUrl: message.fileUrl,
      receiverId: message.receiverId,
      replayTo: message.replayTo,
      type: message.type,
    };
  };
}
