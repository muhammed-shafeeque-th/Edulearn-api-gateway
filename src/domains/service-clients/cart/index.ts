import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { config } from '@/config';
import { CartServiceClient } from '../user/proto/generated/user_service';
import {
  AddToCartRequest,
  AddToCartResponse,
  ClearCartRequest,
  ClearCartResponse,
  ListCartRequest,
  ListCartResponse,
  RemoveFromCartRequest,
  RemoveFromCartResponse,
  ToggleCartItemRequest,
  ToggleCartItemResponse,
} from '../user/proto/generated/user/types/cart_types';

export class CartService {
  private readonly client: GrpcClient<CartServiceClient>;
  private static instance: CartService;

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
      serviceName: 'CartService',
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
  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  public static async shutdown(): Promise<void> {
    if (CartService.instance) {
      try {
        CartService.instance.close();
      } finally {
        // no-op
      }
    }
  }

  async getUserCart(
    request: ListCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<ListCartResponse> {
    const response = await this.client.unaryCall(
      'listUserCart',
      request,
      options
    );
    return response as ListCartResponse;
  }
  async addToCart(
    request: AddToCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<AddToCartResponse> {
    const response = await this.client.unaryCall('addToCart', request, options);
    return response as AddToCartResponse;
  }
  async clearCart(
    request: ClearCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<ClearCartResponse> {
    const response = await this.client.unaryCall('clearCart', request, options);
    return response as ClearCartResponse;
  }
  async toggleCartItem(
    request: ToggleCartItemRequest,
    options: GrpcClientOptions = {}
  ): Promise<ToggleCartItemResponse> {
    const response = await this.client.unaryCall(
      'toggleCartItem',
      request,
      options
    );
    return response as ToggleCartItemResponse;
  }

  // User cart methods
  async removeFromCart(
    request: RemoveFromCartRequest,
    options: GrpcClientOptions = {}
  ): Promise<RemoveFromCartResponse> {
    const response = await this.client.unaryCall(
      'removeFromCart',
      request,
      options
    );
    return response as RemoveFromCartResponse;
  }

  close() {
    this.client.close();
  }
}
