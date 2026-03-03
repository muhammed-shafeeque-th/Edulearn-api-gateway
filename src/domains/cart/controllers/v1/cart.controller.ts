import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { getUserCartSchema } from '../../schemas/get-user-cart.schema';
import { addToCartSchema } from '../../schemas/add-to-cart.schema';
import { removeFromCartSchema } from '../../schemas/remove-from-cart.schema';
import { toggleCartItemSchema } from '../../schemas/toggle-cart.schema';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { CartResponseMapper } from '../../utils/mappers';
import { CourseResponseMapper } from '@/domains/course/utils/mappers';
import { clearCartSchema } from '../../schemas/clear-cart.schema';
import { CartService } from '@/domains/service-clients/cart';
import { CART_MESSAGES } from '../../utils/resposne-messages';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/services/di';

@Observe({ logLevel: 'debug' })
@injectable()
export class CartController {
  constructor(
    @inject(TYPES.CartService) private cartServiceClient: CartService,
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
    @inject(TYPES.CourseService) private courseServiceClient: CourseService
  ) {}

  async getUserCart(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getUserCartSchema
    )!;

    const { success } = await this.cartServiceClient.getUserCart(
      {
        userId,
        pagination,
      },
      { metadata: attachMetadata(req) }
    );

    const mappedCarts = CartResponseMapper.toCart(success!.cart!);
    const paginationResponse = mapPaginationResponse(
      pagination,
      success?.pagination?.totalItems
    );
    if (!mappedCarts || !mappedCarts.items || mappedCarts.items.length === 0) {
      return new ResponseWrapper(res)
        .status(CART_MESSAGES.GET_USER_CART_SUCCESS.statusCode)
        .success(
          mappedCarts,
          CART_MESSAGES.GET_USER_CART_SUCCESS.message,
          paginationResponse
        );
    }

    const courseIds = Array.from(
      new Set(mappedCarts?.items?.map(c => c.courseId!))
    );
    let courseMap: Record<string, any> = {};

    // Batch fetching of courses with list of courseIds
    const { success: courseResponse } =
      await this.courseServiceClient.getCoursesByIds({
        courseIds,
      });

    courseMap = courseResponse?.courses?.courses.reduce(
      (accMap: typeof courseMap, course) => {
        accMap[course.id] = CourseResponseMapper.toCourseInfo(course);
        return accMap;
      },
      {}
    )!;

    return new ResponseWrapper(res)
      .status(CART_MESSAGES.GET_USER_CART_SUCCESS.statusCode)
      .success(
        {
          ...success?.cart,
          items: success?.cart?.items.map(item => ({
            ...item,
            course: courseMap[item.courseId!],
          })),
        },
        CART_MESSAGES.GET_USER_CART_SUCCESS.message,
        paginationResponse
      );
  }

  async getCurrentUserCart(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getUserCartSchema
    )!;

    const { success } = await this.cartServiceClient.getUserCart(
      {
        userId,
        pagination,
      },
      { metadata: attachMetadata(req) }
    );
    const mappedCarts = CartResponseMapper.toCart(success!.cart!);

    const paginationResponse = mapPaginationResponse(
      pagination,
      success?.pagination?.totalItems
    );

    if (!mappedCarts || !mappedCarts.items || mappedCarts.items.length === 0) {
      return new ResponseWrapper(res)
        .status(CART_MESSAGES.GET_USER_CART_SUCCESS.statusCode)
        .success(
          mappedCarts,
          CART_MESSAGES.GET_USER_CART_SUCCESS.message,
          paginationResponse
        );
    }

    const courseIds = Array.from(
      new Set(mappedCarts?.items?.map(c => c.courseId!))
    );
    let courseMap: Record<string, any> = {};

    const { success: courseResponse } =
      await this.courseServiceClient.getCoursesByIds({
        courseIds,
      });

    courseMap = courseResponse?.courses?.courses.reduce(
      (accMap: typeof courseMap, course) => {
        accMap[course.id] = CourseResponseMapper.toCourseInfo(course);
        return accMap;
      },
      {}
    )!;

    return new ResponseWrapper(res)
      .status(CART_MESSAGES.GET_USER_CART_SUCCESS.statusCode)
      .success(
        {
          ...success?.cart,
          items: success?.cart?.items.map(item => ({
            ...item,
            course: courseMap[item.courseId!],
          })),
        },
        CART_MESSAGES.GET_USER_CART_SUCCESS.message,
        paginationResponse
      );
  }

  async removeFromCart(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.query,
        ...req.params,
        ...req.user,
      },
      removeFromCartSchema
    )!;

    const { success } = await this.cartServiceClient.removeFromCart(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    // NO_CONTENT status, commonly does not include a message or payload, but we include our message for consistency.
    return new ResponseWrapper(res)
      .status(CART_MESSAGES.REMOVE_FROM_CART_SUCCESS.statusCode)
      .success(success, CART_MESSAGES.REMOVE_FROM_CART_SUCCESS.message);
  }

  async addToCart(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      addToCartSchema
    )!;

    const { item } = await this.cartServiceClient.addToCart(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CART_MESSAGES.ADD_TO_CART_SUCCESS.statusCode)
      .success(
        CartResponseMapper.toCartItem(item!),
        CART_MESSAGES.ADD_TO_CART_SUCCESS.message
      );
  }
  async clearCart(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      clearCartSchema
    )!;

    await this.cartServiceClient.clearCart(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CART_MESSAGES.REMOVE_FROM_CART_SUCCESS.statusCode)
      .success({}, CART_MESSAGES.REMOVE_FROM_CART_SUCCESS.message);
  }

  async toggleCartItem(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      toggleCartItemSchema
    )!;

    const { item } = await this.cartServiceClient.toggleCartItem(validPayload, {
      metadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(CART_MESSAGES.TOGGLE_CART_ITEM_SUCCESS.statusCode)
      .success(
        CartResponseMapper.toCartItem(item!),
        CART_MESSAGES.TOGGLE_CART_ITEM_SUCCESS.message
      );
  }
}
