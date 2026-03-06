import { Request, Response } from 'express';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { ChatService } from '@/domains/service-clients/chat';
import { UserService } from '@/domains/service-clients/user';
import { attachMetadata } from '@/shared/utils/attach-metadata';
import { DISCUSSION_MESSAGES } from '../../utils/discussion-response-messages';
import { TYPES } from '@/services/di';
import { inject, injectable } from 'inversify';
import validateSchema from '@/services/validate-schema';
import { createDiscussionRoomSchema } from '../../schemas/discussions/create-chat.schema';
import { sendDiscussionMessageSchema } from '../../schemas/discussions/send-discussion-message.schema';
import { getDiscussionMessagesSchema } from '../../schemas/discussions/get-discussion-messages.schema';
import { UserInfo } from '@/domains/user/types';
import { DiscussionResponseMapper } from '../../utils/discussion.mappers';
import { UserResponseMapper } from '@/domains/user/utils/mappers';
import { DiscussionMessage } from '../../types';

@injectable()
export class DiscussionController {
  constructor(
    @inject(TYPES.ChatService) private chatServiceClient: ChatService,
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  async createOrGetRoom(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        userId: req.user?.userId || '',
        userRole: req.user?.role,
      },
      createDiscussionRoomSchema
    )!;

    const { room } = await this.chatServiceClient.createOrGetDiscussionRoom(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(DISCUSSION_MESSAGES.CREATE_ROOM_SUCCESS.statusCode)
      .success(room, DISCUSSION_MESSAGES.CREATE_ROOM_SUCCESS.message);
  }

  async sendMessage(req: Request, res: Response) {
    const { roomId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.userId || '';
    const senderRole = req.user?.role || 'student';
    const idempotencyKey = String(
      req.headers['idempotency-key'] ?? req.headers['x-request-id'] ?? ''
    );

    const validPayload = validateSchema(
      {
        roomId,
        senderId,
        senderRole,
        content,
        idempotencyKey,
      },
      sendDiscussionMessageSchema
    )!;

    const [chatRes, userRes] = await Promise.all([
      this.chatServiceClient.sendDiscussionMessage(validPayload, {
        metadata: attachMetadata(req),
      }),
      this.userService
        .getUser({ userId: senderId }, { metadata: attachMetadata(req) })
        .catch(() => null),
    ]);

    const { message } = chatRes;
    const user = userRes?.user;

    const enrichedMessage = DiscussionResponseMapper.toDiscussionMessage(
      message!,
      user ? UserResponseMapper.toUserInfo(user!) : undefined
    );

    return new ResponseWrapper(res)
      .status(DISCUSSION_MESSAGES.SEND_MESSAGE_SUCCESS.statusCode)
      .success(
        enrichedMessage,
        DISCUSSION_MESSAGES.SEND_MESSAGE_SUCCESS.message
      );
  }

  async getMessages(req: Request, res: Response) {
    const { roomId } = req.params;
    const page = String(req.query.page) || '1';
    const pageSize = String(req.query.pageSize) || '30';
    const userId = req.user?.userId || '';

    const validPayload = validateSchema(
      {
        roomId,
        userId,
        pagination: { page, pageSize },
      },
      getDiscussionMessagesSchema
    )!;

    const { messages } = await this.chatServiceClient.getDiscussionMessages(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    const uniqueUserIds = [
      ...new Set((messages?.messages || []).map((m: any) => m.senderId)),
    ];

    let userMap = new Map<string, UserInfo>();
    if (uniqueUserIds.length > 0) {
      try {
        const { users } = await this.userService.listUsersByIds(
          { userIds: uniqueUserIds },
          { metadata: attachMetadata(req) }
        );
        userMap = new Map(
          (users?.users || []).map(u => [
            u.id,
            UserResponseMapper.toUserInfo(u),
          ])
        );
      } catch (err) {
        console.error(
          'Failed to fetch user details for discussion messages:',
          err
        );
      }
    }

    const enrichedMessages: DiscussionMessage[] = (messages?.messages || []).map(
      m => {
        const u = userMap.get(m.senderId);
        return DiscussionResponseMapper.toDiscussionMessage(m, u);
      }
    );

    return new ResponseWrapper(res)
      .status(DISCUSSION_MESSAGES.GET_MESSAGES_SUCCESS.statusCode)
      .success(
        {
          messages: enrichedMessages,
          total: messages?.total || 0,
        },
        DISCUSSION_MESSAGES.GET_MESSAGES_SUCCESS.message
      );
  }
}
