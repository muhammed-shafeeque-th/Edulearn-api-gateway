import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  AddReactionRequest,
  ArchiveChatRequest,
  ChatServiceClient,
  ChatResponse,
  CreateChatRequest,
  DeleteChatRequest,
  DeleteMessageRequest,
  EditMessageRequest,
  Empty,
  GetChatRequest,
  GetMessagesRequest,
  GetMessagesResponse,
  ListStudentChatsRequest,
  MarkMessagesReadRequest,
  MessageResponse,
  PinChatRequest,
  RemoveReactionRequest,
  SendMessageRequest,
  UnArchiveChatRequest,
  UnPinChatRequest,
  ChatsListResponse,
  ListInstructorChatsRequest,
  OnlineUsersResponse,
} from './proto/generated/chat_service';
import { config } from 'config';

export class ChatService {
  private readonly client: GrpcClient<ChatServiceClient>;
  private static instance: ChatService;

  private constructor() {
    const [host = 'localhost', port = '50059'] =
      config.grpc.services.chatService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'chat',
        'chat_service.proto'
      ),
      packageName: 'chat_service',
      serviceName: 'ChatService',
      host,
      port: parseInt(port),
    });
  }

  // Singleton pattern
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async addReaction(
    request: AddReactionRequest,
    options: GrpcClientOptions = {}
  ): Promise<MessageResponse> {
    const response = await this.client.unaryCall(
      'addReaction',
      request,
      options
    );
    return response as MessageResponse;
  }
  async archiveChat(
    request: ArchiveChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall(
      'archiveChat',
      request,
      options
    );
    return response as ChatResponse;
  }
  async getChat(
    request: GetChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall('getChat', request, options);
    return response as ChatResponse;
  }
  async deleteChat(
    request: DeleteChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<Empty> {
    const response = await this.client.unaryCall(
      'deleteChat',
      request,
      options
    );
    return response as Empty;
  }
  async listStudentChats(
    request: ListStudentChatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatsListResponse> {
    const response = await this.client.unaryCall(
      'listStudentChats',
      request,
      options
    );
    return response as ChatsListResponse;
  }
  async listInstructorChats(
    request: ListInstructorChatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatsListResponse> {
    const response = await this.client.unaryCall(
      'listInstructorChats',
      request,
      options
    );
    return response as ChatsListResponse;
  }
  async createOrGetChat(
    request: CreateChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall(
      'createChat',
      request,
      options
    );
    return response as ChatResponse;
  }
  async pinChat(
    request: PinChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall('pinChat', request, options);
    return response as ChatResponse;
  }
  async unPinChat(
    request: UnPinChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall('unPinChat', request, options);
    return response as ChatResponse;
  }
  async unArchiveChat(
    request: UnArchiveChatRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall(
      'unArchiveChat',
      request,
      options
    );
    return response as ChatResponse;
  }
  async getOnlineUsers(
    request: Empty,
    options: GrpcClientOptions = {}
  ): Promise<OnlineUsersResponse> {
    const response = await this.client.unaryCall(
      'getOnlineUsers',
      request,
      options
    );
    return response as OnlineUsersResponse;
  }
  async sendMessage(
    request: SendMessageRequest,
    options: GrpcClientOptions = {}
  ): Promise<MessageResponse> {
    const response = await this.client.unaryCall(
      'sendMessage',
      request,
      options
    );
    return response as MessageResponse;
  }
  async getMessages(
    request: GetMessagesRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetMessagesResponse> {
    const response = await this.client.unaryCall(
      'getMessages',
      request,
      options
    );
    return response as GetMessagesResponse;
  }

  async editMessage(
    request: EditMessageRequest,
    options: GrpcClientOptions = {}
  ): Promise<MessageResponse> {
    const response = await this.client.unaryCall(
      'editMessage',
      request,
      options
    );
    return response as MessageResponse;
  }
  async deleteMessage(
    request: DeleteMessageRequest,
    options: GrpcClientOptions = {}
  ): Promise<Empty> {
    const response = await this.client.unaryCall(
      'deleteMessage',
      request,
      options
    );
    return response as Empty;
  }
  async removeReaction(
    request: RemoveReactionRequest,
    options: GrpcClientOptions = {}
  ): Promise<MessageResponse> {
    const response = await this.client.unaryCall(
      'removeReaction',
      request,
      options
    );
    return response as MessageResponse;
  }
  async markMessagesRead(
    request: MarkMessagesReadRequest,
    options: GrpcClientOptions = {}
  ): Promise<ChatResponse> {
    const response = await this.client.unaryCall(
      'markMessagesRead',
      request,
      options
    );
    return response as ChatResponse;
  }

  close() {
    this.client.close();
  }
}
