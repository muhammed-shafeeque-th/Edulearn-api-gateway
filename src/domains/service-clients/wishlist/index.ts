import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { config } from '@/config';
import { WishlistServiceClient } from '../user/proto/generated/user_service';
import {
  AddToWishlistRequest,
  AddToWishlistResponse,
  ListWishlistRequest,
  ListWishlistResponse,
  RemoveFromWishlistRequest,
  RemoveFromWishlistResponse,
  ToggleWishlistItemRequest,
  ToggleWishlistItemResponse,
} from '../user/proto/generated/user/types/wishlist_types';
export class WishlistService {
  private readonly client: GrpcClient<WishlistServiceClient>;
  private static instance: WishlistService;

  public constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.userServiceClient.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'user',
        'user_service.proto'
      ),
      packageName: 'user_service',
      serviceName: 'WishlistService',
      host,
      port: parseInt(port),
      loaderOptions: {
        includeDirs: [path.join(process.cwd(), 'proto', 'user')],
      },
    });
  }

  /**
   * @deprecated Use DI container instead
   */
  public static getInstance(): WishlistService {
    if (!WishlistService.instance) {
      WishlistService.instance = new WishlistService();
    }
    return WishlistService.instance;
  }

  public static async shutdown(): Promise<void> {
    if (WishlistService.instance) {
      try {
        WishlistService.instance.close();
      } finally {
        // no-op
      }
    }
  }

  async getUserWishlist(
    request: ListWishlistRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListWishlistResponse> {
    const response = await this.client.unaryCall(
      'listUserWishlist',
      request,
      options
    );
    return response as ListWishlistResponse;
  }
  async addToWishlist(
    request: AddToWishlistRequest,
    options: GrpcClientOptions = {}
  ): Promise<AddToWishlistResponse> {
    const response = await this.client.unaryCall(
      'addToWishlist',
      request,
      options
    );
    return response as AddToWishlistResponse;
  }
  async removeFromWishlist(
    request: RemoveFromWishlistRequest,
    options: GrpcClientOptions = {}
  ): Promise<RemoveFromWishlistResponse> {
    const response = await this.client.unaryCall(
      'removeFromWishlist',
      request,
      options
    );
    return response as RemoveFromWishlistResponse;
  }

  async toggleWishlistItem(
    request: ToggleWishlistItemRequest,
    options: GrpcClientOptions = {}
  ): Promise<ToggleWishlistItemResponse> {
    const response = await this.client.unaryCall(
      'toggleWishlistItem',
      request,
      options
    );
    return response as ToggleWishlistItemResponse;
  }

  close() {
    this.client.close();
  }
}
