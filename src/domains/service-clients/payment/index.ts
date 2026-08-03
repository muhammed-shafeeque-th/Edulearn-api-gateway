import path from 'path';
import {
  CancelPaymentRequest,
  CancelPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  CreateProviderSessionRequest,
  CreateProviderSessionResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  PaymentServiceClient,
  ResolvePaymentRequest,
  ResolvePaymentResponse,
} from './proto/generated/payment_service';
import { config } from '@/config';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { getProtoPath } from '@edulearn/core';

export class PaymentService {
  private readonly client: GrpcClient<PaymentServiceClient>;
  private static instance: PaymentService;

  public constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.paymentService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(getProtoPath('payment')),
      packageName: 'payment_service',
      serviceName: 'PaymentService',
      host,
      port: parseInt(port),
      deadlineMs: 30000,
      circuitBreakerConfig: {
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        volumeThreshold: Number.MAX_SAFE_INTEGER,
        timeout: 60_000,
      },
    });
  }

  async createPayment(
    request: CreatePaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<CreatePaymentResponse> {
    const response = await this.client.unaryCall(
      'createPayment',
      request,
      options
    );
    return response as CreatePaymentResponse;
  }

  async createProviderSession(
    request: CreateProviderSessionRequest,
    options: GrpcClientOptions = {}
  ): Promise<CreateProviderSessionResponse> {
    const response = await this.client.unaryCall(
      'createProviderSession',
      request,
      options
    );
    return response as CreateProviderSessionResponse;
  }

  async resolvePayment(
    request: ResolvePaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<ResolvePaymentResponse> {
    const response = await this.client.unaryCall(
      'resolvePayment',
      request,
      options
    );
    return response as ResolvePaymentResponse;
  }

  async cancelPayment(
    request: CancelPaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<CancelPaymentResponse> {
    const response = await this.client.unaryCall(
      'cancelPayment',
      request,
      options
    );
    return response as CancelPaymentResponse;
  }
  async getPayment(
    request: GetPaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetPaymentResponse> {
    const response = await this.client.unaryCall(
      'getPayment',
      request,
      options
    );
    return response as GetPaymentResponse;
  }

  // async processRefund(
  //   request: ProcessRefundRequest,
  //   options: GrpcClientOptions = {}
  // ): Promise<ProcessRefundResponse> {
  //   const response = await this.client.unaryCall(
  //     'processRefund',
  //     request,
  //     options
  //   );
  //   return response as ProcessRefundResponse;
  // }

  /**
   * @deprecated Use Dependency Injection
   */
  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  close() {
    this.client.close();
  }
}
