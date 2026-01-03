import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  AddReactionRequest,
  ArchiveConversationRequest,
  ChatServiceClient,
  ConversationResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationRequest,
  DeleteMessageRequest,
  EditMessageRequest,
  EditMessageResponse,
  Empty,
  GetConversationRequest,
  GetConversationResponse,
  GetMessagesRequest,
  GetMessagesResponse,
  ListUserConversationsRequest,
  ListUserConversationsResponse,
  MarkMessagesReadRequest,
  MessageResponse,
  PinConversationRequest,
  RemoveReactionRequest,
  SendMessageRequest,
  SendMessageResponse,
  UnArchiveConversationRequest,
  UnPinConversationRequest,
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
  async archiveConversation(
    request: ArchiveConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<ConversationResponse> {
    const response = await this.client.unaryCall(
      'archiveConversation',
      request,
      options
    );
    return response as ConversationResponse;
  }
  async getConversation(
    request: GetConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetConversationResponse> {
    const response = await this.client.unaryCall(
      'getConversation',
      request,
      options
    );
    return response as GetConversationResponse;
  }
  async deleteConversation(
    request: DeleteConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<Empty> {
    const response = await this.client.unaryCall(
      'deleteConversation',
      request,
      options
    );
    return response as Empty;
  }
  async listUserConversations(
    request: ListUserConversationsRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListUserConversationsResponse> {
    const response = await this.client.unaryCall(
      'listUserConversations',
      request,
      options
    );
    return response as ListUserConversationsResponse;
  }
  async createConversation(
    request: CreateConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<CreateConversationResponse> {
    const response = await this.client.unaryCall(
      'createConversation',
      request,
      options
    );
    return response as CreateConversationResponse;
  }
  async pinConversation(
    request: PinConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<ConversationResponse> {
    const response = await this.client.unaryCall(
      'pinConversation',
      request,
      options
    );
    return response as ConversationResponse;
  }
  async unPinConversation(
    request: UnPinConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<ConversationResponse> {
    const response = await this.client.unaryCall(
      'unPinConversation',
      request,
      options
    );
    return response as ConversationResponse;
  }
  async unArchiveConversation(
    request: UnArchiveConversationRequest,
    options: GrpcClientOptions = {}
  ): Promise<ConversationResponse> {
    const response = await this.client.unaryCall(
      'unArchiveConversation',
      request,
      options
    );
    return response as ConversationResponse;
  }
  async sendMessage(
    request: SendMessageRequest,
    options: GrpcClientOptions = {}
  ): Promise<SendMessageResponse> {
    const response = await this.client.unaryCall(
      'sendMessage',
      request,
      options
    );
    return response as SendMessageResponse;
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
  ): Promise<EditMessageResponse> {
    const response = await this.client.unaryCall(
      'editMessage',
      request,
      options
    );
    return response as EditMessageResponse;
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
  ): Promise<ConversationResponse> {
    const response = await this.client.unaryCall(
      'markMessagesRead',
      request,
      options
    );
    return response as ConversationResponse;
  }

  close() {
    this.client.close();
  }
}
