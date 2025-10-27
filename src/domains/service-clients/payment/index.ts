import path from 'path';
import {
  CapturePaymentRequest,
  CapturePaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentServiceClient,
  ProcessRefundRequest,
  ProcessRefundResponse,
  RazorpayVerifyPaymentRequest,
  RazorpayVerifyResponse,
} from './proto/generated/payment-service';
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
      protoPath: path.join(__dirname, 'proto', 'payment_service.proto'),
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

  async payPalPaymentCapture(
    request: CapturePaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<CapturePaymentResponse> {
    const response = await this.client.unaryCall(
      'payPalPaymentCapture',
      request,
      options
    );
    return response as CapturePaymentResponse;
  }

  async razorpayVerifyPayment(
    request: RazorpayVerifyPaymentRequest,
    options: GrpcClientOptions = {}
  ): Promise<RazorpayVerifyResponse> {
    const response = await this.client.unaryCall(
      'razorpayVerifyPayment',
      request,
      options
    );
    return response as RazorpayVerifyResponse;
  }

  async processRefund(
    request: ProcessRefundRequest,
    options: GrpcClientOptions = {}
  ): Promise<ProcessRefundResponse> {
    const response = await this.client.unaryCall(
      'processRefund',
      request,
      options
    );
    return response as ProcessRefundResponse;
  }

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
