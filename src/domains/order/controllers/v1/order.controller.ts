import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { HttpStatus } from '@/shared/constants/http-status';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { OrderService } from '../../../service-clients/order';
import { placeOrderSchema } from '../../schemas/place-order.schema';
import { getOrderByIdSchema } from '../../schemas/get-order.schema';
import { getOrdersByUserSchema } from '../../schemas/get-orders.schema';
import { OrderData } from '@/domains/service-clients/order/proto/generated/order_service';
import { Order } from '../../types';
import { attachMetadata } from '../../utils/attach-metadata';

@Observe({ logLevel: 'debug' })
export class OrderController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private courseServiceClient: CourseService;
  private orderServiceClient: OrderService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
    this.orderServiceClient = OrderService.getInstance();
  }

  async placeOrder(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      placeOrderSchema
    )!;

    

    const { success } = await this.orderServiceClient.placeOrder(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    console.log('Order response ' + JSON.stringify(success?.order, null, 2));

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapToResponse(success?.order as OrderData),
        'Order placed successfully'
      );
  }

  async getOrder(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getOrderByIdSchema
    )!;

    

    const { success } = await this.orderServiceClient.getOrderById(
      validPayload,
      { attachMetadata: attachMetadata(req) }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapToResponse(success?.order),
        'Order fetched successfully'
      );
  }

  async getOrdersByUser(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getOrdersByUserSchema
    )!;

    

    const { success } = await this.orderServiceClient.getOrdersByUserId(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        success?.orders.map(this.mapToResponse),
        'Order fetched successfully'
      );
  }

  // Mapping Functions
  private mapToResponse = (dto?: OrderData): Order | undefined => {
    if (!dto) return undefined;
    return {
      id: dto.id,
      currency: dto.amount!.currency,
      discount: dto.amount!.discount,
      subTotal: dto.amount!.subTotal,
      status: dto.status,
      totalAmount: dto.amount!.price,
      items: dto.items.map(item => ({
        courseId: item.courseId,
        price: item.price,
      })),
      updatedAt: dto.updatedAt,
      paymentDetails: dto.paymentDetails
        ? {
            paymentId: dto.paymentDetails?.paymentId,
            paymentStatus: dto.paymentDetails?.paymentStatus,
            provider: dto.paymentDetails?.provider,
            updatedAt: dto.paymentDetails?.updatedAt,
            providerOrderId: dto.paymentDetails?.providerOrderId,
          }
        : undefined,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };
}
