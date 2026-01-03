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
import { verifyPaymentSchema } from '../../schemas/verify-payment.schema';
import { CreatePaymentSuccess } from '@/domains/service-clients/payment/proto/generated/payment_service';
import { cancelPaymentSchema } from '../../schemas/cancel-payment.schema';
import { getPaymentSchema } from '../../schemas/get-payment.schema';
import { PAYMENT_MESSAGES } from '../../utils/resposne-messages';

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
    const validPayload = validateSchema(
      {
        ...req.body,
        provider: req.params?.provider,
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
      .status(PAYMENT_MESSAGES.PAYMENT_CREATED.statusCode)
      .success(
        {
          userDetails: {
            email: req.user?.email,
            name: req.user?.username,
          },
          ...this.mapToResponse(success),
        },
        PAYMENT_MESSAGES.PAYMENT_CREATED.message
      );
  }

  async verifyPayment(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
      },
      verifyPaymentSchema
    )!;

    const { success } = await this.paymentServiceClient.verifyPayment(
      validPayload,
      { attachMetadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_CAPTURED.statusCode)
      .success(success, PAYMENT_MESSAGES.PAYMENT_CAPTURED.message);
  }

  async cancelPayment(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      cancelPaymentSchema
    )!;

    const { success } = await this.paymentServiceClient.cancelPayment(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_VERIFIED.statusCode)
      .success(success, PAYMENT_MESSAGES.PAYMENT_VERIFIED.message);
  }

  async getPayment(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getPaymentSchema
    )!;

    const { success } = await this.paymentServiceClient.getPayment(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_VERIFIED.statusCode)
      .success(success, PAYMENT_MESSAGES.PAYMENT_VERIFIED.message);
  }

  // --- Future Example Methods ---

  /**
   * For demonstration: Refund payment (future)
   */
  async refundPayment(req: Request, res: Response) {
    // Implementation for future
    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_REFUNDED.statusCode)
      .success({}, PAYMENT_MESSAGES.PAYMENT_REFUNDED.message);
  }

  /**
   * For demonstration: Update payment status (future)
   */
  async updatePaymentStatus(req: Request, res: Response) {
    // Implementation for future
    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_STATUS_UPDATED.statusCode)
      .success({}, PAYMENT_MESSAGES.PAYMENT_STATUS_UPDATED.message);
  }

  // Mapping Functions
  private mapToResponse = (dto?: CreatePaymentSuccess) => {
    if (!dto) return undefined;
    return {
      ...dto,
    };
  };
}
