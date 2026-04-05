import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import {
  BookSessionRequest,
  BookSessionResponse,
  GetOrderByIdRequest,
  GetOrdersRequest,
  GetOrderStatusRequest,
  GetRevenueStatsRequest,
  GetRevenueStatsResponse,
  OrderResponse,
  OrderServiceClient,
  OrdersResponse,
  OrderStatusResponse,
  PlaceOrderRequest,
  RestoreOrderRequest,
} from './proto/generated/order_service';
import { config } from 'config';

export class OrderService {
  private readonly client: GrpcClient<OrderServiceClient>;
  private static instance: OrderService;

  public constructor() {
    const [host = 'localhost', port = '50054'] =
      config.grpc.services.orderService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'order',
        'order_service.proto'
      ),
      packageName: 'order_service',
      serviceName: 'OrderService',
      host,
      port: parseInt(port),
      deadlineMs: 30000,
    });
  }

  /**
   * @deprecated Use Dependency Injection
   */
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
  async resetOrder(
    request: RestoreOrderRequest,
    options: GrpcClientOptions = {}
  ): Promise<OrderResponse> {
    const response = await this.client.unaryCall(
      'restoreOrder',
      request,
      options
    );
    return response as OrderResponse;
  }
  async getOrderStatus(
    request: GetOrderStatusRequest,
    options: GrpcClientOptions = {}
  ): Promise<OrderStatusResponse> {
    const response = await this.client.unaryCall(
      'getOrderStatus',
      request,
      options
    );
    return response as OrderStatusResponse;
  }
  async getOrdersByUserId(
    request: GetOrdersRequest,
    options: GrpcClientOptions = {}
  ): Promise<OrdersResponse> {
    const response = await this.client.unaryCall('getOrders', request, options);
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
  async getRevenueStats(
    request: GetRevenueStatsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetRevenueStatsResponse> {
    const response = await this.client.unaryCall(
      'getRevenueStats',
      request,
      options
    );
    return response as GetRevenueStatsResponse;
  }

  close() {
    this.client.close();
  }
}
