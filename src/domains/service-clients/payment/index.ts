import path from 'path';
import {
  CancelPaymentRequest,
  CancelPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  PaymentServiceClient,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from './proto/generated/payment_service';
import { config } from 'config';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';

export class PaymentService {
  private readonly client: GrpcClient<PaymentServiceClient>;
  private static instance: PaymentService;

  private constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.paymentService.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'payment',
        'payment_service.proto'
      ),
      packageName: 'payment_service',
      serviceName: 'PaymentService',
      host,
      port: parseInt(port),
      circuitBreakerConfig: {
        errorThresholdPercentage: 50,
        resetTimeout: 3000,
        volumeThreshold: Number.MAX_SAFE_INTEGER,
        timeout: 30000,
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

  async verifyPayment(
    request: VerifyPaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<VerifyPaymentResponse> {
    const response = await this.client.unaryCall(
      'verifyPayment',
      request,
      options
    );
    return response as VerifyPaymentResponse;
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

  // Singleton pattern
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
