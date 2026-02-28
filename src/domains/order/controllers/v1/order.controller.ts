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
import { CourseMetadata } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { getOrderStatusSchema } from '../../schemas/get-order-status.schema';
import { CourseInfo } from '@/domains/course/types';
import { OrderResponseMapper } from '../../utils/mappers';
import { CourseResponseMapper } from '@/domains/course/utils/mappers';
import { restoreOrderSchema } from '../../schemas/restore-order.schema';
import { ORDER_MESSAGES } from '../../utils/resposne-messages';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { TYPES } from '@/services/di';
import { inject, injectable } from 'inversify';

@Observe({ logLevel: 'debug' })
@injectable()
export class OrderController {
  constructor(
    @inject(TYPES.UserService) private userServiceClient: UserService,
    @inject(TYPES.CourseService) private courseServiceClient: CourseService,
    @inject(TYPES.OrderService) private orderServiceClient: OrderService
  ) {}

  async placeOrder(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.user,
      },
      placeOrderSchema
    )!;

    const { success } = await this.orderServiceClient.placeOrder(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(ORDER_MESSAGES.ORDER_PLACED.statusCode)
      .success(
        OrderResponseMapper.toOrder(success?.order as OrderData),
        ORDER_MESSAGES.ORDER_PLACED.message
      );
  }

  async getOrder(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      getOrderByIdSchema
    )!;

    const { success } = await this.orderServiceClient.getOrderById(
      validPayload,
      { metadata: attachMetadata(req) }
    );

    const { order } = success || {};

    const courseIds = [...new Set(order?.items?.map(c => c.courseId!))];
    let courseMap: Record<string, CourseInfo> = {};

    if (courseIds.length > 0) {
      const { success: courseResponse } =
        await this.courseServiceClient.getCoursesByIds({
          courseIds,
        });

      courseMap =
        courseResponse?.courses?.courses.reduce(
          (accMap: typeof courseMap, course) => {
            accMap[course.id] = CourseResponseMapper.toCourseInfo(course);
            return accMap;
          },
          {}
        ) ?? {};
    }
    const orderRes = OrderResponseMapper.toOrder(order);

    const response: Order = {
      ...orderRes!,
      items: orderRes!.items.map(item => ({
        courseId: item.courseId,
        price: item.price,
        course: courseMap[item.courseId],
      })),
    };

    return new ResponseWrapper(res)
      .status(ORDER_MESSAGES.ORDER_FETCHED.statusCode)
      .success(response, ORDER_MESSAGES.ORDER_FETCHED.message);
  }

  async resetOrder(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      restoreOrderSchema
    )!;

    const { success } = await this.orderServiceClient.resetOrder(validPayload, {
      metadata: attachMetadata(req),
    });

    const { order } = success || {};

    const courseIds = [...new Set(order?.items?.map(c => c.courseId!))];
    let courseMap: Record<string, CourseInfo> = {};

    if (courseIds.length > 0) {
      const { success: courseResponse } =
        await this.courseServiceClient.getCoursesByIds({
          courseIds,
        });

      courseMap =
        courseResponse?.courses?.courses.reduce(
          (accMap: typeof courseMap, course) => {
            accMap[course.id] = CourseResponseMapper.toCourseInfo(course);
            return accMap;
          },
          {}
        ) ?? {};
    }
    const orderRes = OrderResponseMapper.toOrder(order);

    const response: Order = {
      ...orderRes!,
      items: orderRes!.items.map(item => ({
        courseId: item.courseId,
        price: item.price,
        course: courseMap[item.courseId],
      })),
    };

    return new ResponseWrapper(res)
      .status(ORDER_MESSAGES.ORDER_FETCHED.statusCode)
      .success(response, ORDER_MESSAGES.ORDER_FETCHED.message);
  }

  /**
   * Fetches all orders for the authenticated user, with pagination and course detail expansion.
   */
  async getOrdersByUser(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        params: req.query,
        userId: req.user?.userId,
      },
      getOrdersByUserSchema
    )!;

    const { success } = await this.orderServiceClient.getOrdersByUserId(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );
    const { orders } = success || {};

    const courseIds = [
      ...new Set(orders?.flatMap(order => order.items?.map(c => c.courseId))),
    ];

    const paginationResponse = mapPaginationResponse(
      {
        page: validPayload.params!.page!,
        pageSize: validPayload.params!.pageSize!,
      },
      success?.total
    );

    if (!orders?.length || !success?.total) {
      // This will handle the case where there are no orders for the user.
      return new ResponseWrapper(res)
        .status(ORDER_MESSAGES.ORDERS_FETCHED.statusCode)
        .success([], ORDER_MESSAGES.ORDERS_FETCHED.message, paginationResponse);
    }

    let courseMap: Record<string, CourseInfo> = {};

    if (courseIds.length > 0) {
      const { success: courseResponse } =
        await this.courseServiceClient.getCoursesByIds({
          courseIds,
        });

      courseMap =
        courseResponse?.courses?.courses.reduce(
          (accMap: typeof courseMap, course) => {
            accMap[course.id] = CourseResponseMapper.toCourseInfo(course);
            return accMap;
          },
          {}
        ) ?? {};
    }
    const ordersRes = success!.orders.map(OrderResponseMapper.toOrder);

    const response: Order[] = ordersRes.map(order => ({
      ...order!,
      items: order!.items.map(item => ({
        courseId: item.courseId,
        price: item.price,
        course: courseMap[item.courseId],
      })),
    }));

    // Use ORDERS_FETCHED message for getting multiple orders
    return new ResponseWrapper(res)
      .status(ORDER_MESSAGES.ORDERS_FETCHED.statusCode)
      .success(
        response,
        ORDER_MESSAGES.ORDERS_FETCHED.message,
        paginationResponse
      );
  }

  async getOrderStatus(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.params,
      },
      getOrderStatusSchema
    )!;
    const { success } =
      await this.orderServiceClient.getOrderStatus(validPayload);

    return new ResponseWrapper(res)
      .status(ORDER_MESSAGES.ORDER_STATUS_FETCHED.statusCode)
      .success(success, ORDER_MESSAGES.ORDER_STATUS_FETCHED.message);
  }
}
