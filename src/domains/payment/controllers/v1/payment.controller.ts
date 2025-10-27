import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { HttpStatus } from '@/shared/constants/http-status';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { PaymentService } from '@/domains/service-clients/payment';
import { attachMetadata } from '../../utils/attach-metadata';
import { createPaymentSchema } from '../../schemas/create-payment.schema';
import { capturePaypalPaySchema } from '../../schemas/capture-payment.schema';
import { verifyRazorPaySchema } from '../../schemas/verify-payment.schema';
import { CreatePaymentSuccess } from '@/domains/service-clients/payment/proto/generated/payment-service';

@Observe({ logLevel: 'debug' })
export class PaymentController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private courseServiceClient: CourseService;
  private paymentServiceClient: PaymentService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
    this.paymentServiceClient = PaymentService.getInstance();
  }

  async createPayment(req: Request, res: Response) {
    console.log('Req headers : ' + JSON.stringify(req.headers, null, 2));

    const validPayload = validateSchema(
      {
        ...req.body,
        paymentGateway: req.params?.provider,
        ...req.user,
        idempotencyKey:
          req.headers['idempotency-key'] ?? req.headers['x-request-id'],
      },
      createPaymentSchema
    )!;

    console.log(
      'create payment payload ' + JSON.stringify(validPayload, null, 2)
    );

    const { success } = await this.paymentServiceClient.createPayment(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(this.mapToResponse(success), 'Payment created successfully');
  }

  async capturePaypalPayment(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
      },
      capturePaypalPaySchema
    )!;

    const { success } = await this.paymentServiceClient.payPalPaymentCapture(
      validPayload,
      { attachMetadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(success, 'Payment captured successfully');
  }

  async verifyRazorPayPayment(req: Request, res: Response) {
    // console.log('req.body ' + JSON.stringify({ body: req.body }, null, 2));

    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      verifyRazorPaySchema
    )!;

    const { success } = await this.paymentServiceClient.razorpayVerifyPayment(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(success, 'Payment verified successfully');
  }

  // Mapping Functions
  private mapToResponse = (dto?: CreatePaymentSuccess) => {
    if (!dto) return undefined;
    return {
      ...(dto.paypal
        ? { paypal: { ...dto.paypal } }
        : dto.razorpay
          ? { razorpay: { ...dto.razorpay } }
          : { stripe: { ...dto.stripe } }),
    };
  };
}
