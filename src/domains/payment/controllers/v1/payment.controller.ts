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
import { CreateProviderSessionResponse } from '@/domains/service-clients/payment/proto/generated/payment_service';
import {
  createPaymentSchema,
  createProviderSessionSchema,
} from '../../schemas/create-payment.schema';
import { resolvePaymentSchema } from '../../schemas/resolve-payment.schema';
import { cancelPaymentSchema } from '../../schemas/cancel-payment.schema';
import { getPaymentSchema } from '../../schemas/get-payment.schema';
import { PAYMENT_MESSAGES } from '../../utils/resposne-messages';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/services/di';

@Observe({ logLevel: 'debug' })
@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.PaymentService) private paymentServiceClient: PaymentService
  ) {}

  async createPayment(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        userId: req.user?.userId,
        idempotencyKey:
          req.headers['idempotency-key'] ?? req.headers['x-request-id'],
      },
      createPaymentSchema
    )!;

    const { success } = await this.paymentServiceClient.createPayment(
      validPayload,
      {
        metadata: attachMetadata(req),
        options: { deadline: Date.now() + 60_000 },
      }
    );

    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_CREATED.statusCode)
      .success(
        {
          ...success,
        },
        PAYMENT_MESSAGES.PAYMENT_CREATED.message
      );
  }

  async createProviderSession(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        paymentId: req.params.paymentId,
      },
      createProviderSessionSchema
    )!;

    const { success } = await this.paymentServiceClient.createProviderSession(
      validPayload,
      {
        metadata: attachMetadata(req),
        options: { deadline: Date.now() + 60_000 },
      }
    );

    console.log('Provider session :' + JSON.stringify(success, null, 2));

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        userDetails: {
          email: req.user?.email,
          name: req.user?.username,
        },
        userId: req.user?.userId,
        ...this.mapProviderSessionResponse(success),
      },
      'Payment provider session created successfully'
    );
  }

  async resolvePayment(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
      },
      resolvePaymentSchema
    )!;

    const { success } = await this.paymentServiceClient.resolvePayment(
      validPayload,
      { metadata: attachMetadata(req) }
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
        metadata: attachMetadata(req),
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
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(PAYMENT_MESSAGES.PAYMENT_VERIFIED.statusCode)
      .success(success, PAYMENT_MESSAGES.PAYMENT_VERIFIED.message);
  }

  // Future  Methods

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
  private mapProviderSessionResponse = (
    dto?: CreateProviderSessionResponse['success']
  ) => {
    if (!dto) return undefined;
    return {
      paymentId: dto.paymentId,
      provider: dto.provider,
      stripe: dto.stripe,
      razorpay: dto.razorpay,
      paypal: dto.paypal,
    };
  };
}
