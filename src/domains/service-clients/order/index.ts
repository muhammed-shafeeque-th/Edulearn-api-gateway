import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  BookSessionRequest,
  BookSessionResponse,
  GetOrderByIdRequest,
  GetOrderByUserIdRequest,
  OrderResponse,
  OrderServiceClient,
  OrdersResponse,
  PlaceOrderRequest,
} from './proto/generated/order_service';
import { config } from 'config';

export class OrderService {
  private readonly client: GrpcClient<OrderServiceClient>;
  private static instance: OrderService;

  private constructor() {
    const [host = 'localhost', port = '50054'] =
      config.grpc.services.orderService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(__dirname, 'proto', 'order_service.proto'),
      packageName: 'order_service',
      serviceName: 'OrderService',
      host,
      port: parseInt(port),
    });
  }

  // Singleton pattern
  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async bookSession(
    request: BookSessionRequest,
    options: GrpcClientOptions = {}
  ): Promise<BookSessionResponse> {
    const response = await this.client.unaryCall(
      'bookSession',
      request,
      options
    );
    return response as BookSessionResponse;
  }
  async getOrderById(
    request: GetOrderByIdRequest,
    options: GrpcClientOptions = {}
  ): Promise<OrderResponse> {
    const response = await this.client.unaryCall(
      'getOrderById',
      request,
      options
    );
    return response as OrderResponse;
  }
  async getOrdersByUserId(
    request: GetOrderByUserIdRequest,
    options: GrpcClientOptions = {}
  ): Promise<OrdersResponse> {
    const response = await this.client.unaryCall(
      'getOrdersByUserId',
      request,
      options
    );
    return response as OrdersResponse;
  }
  async placeOrder(
    request: PlaceOrderRequest,
    options: GrpcClientOptions = {}
  ): Promise<OrderResponse> {
    const response = await this.client.unaryCall(
      'placeOrder',
      request,
      options
    );
    return response as OrderResponse;
  }

  close() {
    this.client.close();
  }
}
