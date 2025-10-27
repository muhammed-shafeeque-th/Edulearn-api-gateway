import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { HttpStatus } from '@/shared/constants/http-status';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import {} from '@/shared/utils/metadata-manager';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { getUserCartSchema } from '../../schemas/get-user-cart.schema';
import { Cart, CartItem } from '../../types';
import { addToCartSchema } from '../../schemas/add-to-cart.schema';
import { removeFromCartSchema } from '../../schemas/remove-from-cart.schema';
import {
  CartData,
  CartItemData,
} from '@/domains/service-clients/user/proto/generated/user_service';
import { toggleCartItemSchema } from '../../schemas/add-to-cart.schema copy';
import { CourseData } from '@/domains/service-clients/course/proto/generated/course_service';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';

@Observe({ logLevel: 'debug' })
export class CartController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private courseServiceClient: CourseService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
  }

  async getUserCart(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getUserCartSchema
    )!;

    const { success } = await this.userServiceClient.getUserCart(
      {
        userId,
        pagination,
      },
      { attachMetadata: attachMetadata(req) }
    );

    const mappedCarts = this.mapToCartResponse(success!.cart!);

    const paginationResponse = mapPaginationResponse(
      pagination,
      mappedCarts?.total
    );
    if (!mappedCarts || !mappedCarts.items || mappedCarts.items.length === 0) {
      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(
          mappedCarts,
          'User cart fetched successfully',
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
        accMap[course.id] = this.mapToCartItemCourseResponse(course);
        return accMap;
      },
      {}
    )!;

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        ...success?.cart,
        items: success?.cart?.items.map(item => ({
          ...item,
          course: courseMap[item.courseId!],
        })),
      },

      'User cart fetched successfully',
      paginationResponse
    );

    // return new ResponseWrapper(res).status(HttpStatus.OK).success(
    //   // success?.cart?.items.map(this.mapToCartResponse),
    //   'User cart fetched successfully'
    // );
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

    const { success } = await this.userServiceClient.getUserCart(
      {
        userId,
        pagination,
      },
      { attachMetadata: attachMetadata(req) }
    );
    const mappedCarts = this.mapToCartResponse(success!.cart!);

    const paginationResponse = mapPaginationResponse(
      pagination,
      mappedCarts?.total
    );

    if (!mappedCarts || !mappedCarts.items || mappedCarts.items.length === 0) {
      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(
          mappedCarts,
          'User cart fetched successfully',
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
        accMap[course.id] = this.mapToCartItemCourseResponse(course);
        return accMap;
      },
      {}
    )!;

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        ...success?.cart,
        items: success?.cart?.items.map(item => ({
          ...item,
          course: courseMap[item.courseId!],
        })),
      },
      'User cart fetched successfully',
      paginationResponse
    );
  }

  async removeFromCart(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      removeFromCartSchema
    )!;

    const { success } = await this.userServiceClient.removeFromCart(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res).status(HttpStatus.NO_CONTENT);
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

    const { item } = await this.userServiceClient.addToCart(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.CREATED)
      .success(this.mapToCartItemResponse(item!), 'Item added to cart');
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

    const { item } = await this.userServiceClient.toggleCartItem(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.CREATED)
      .success(this.mapToCartItemResponse(item!), 'operation successful');
  }

  // Mapping Functions
  private mapToCartResponse = (dto: CartData): Cart | undefined => {
    if (!dto) return;
    return {
      id: dto.id,
      total: dto.total,
      items: dto.items.map(this.mapToCartItemResponse),
      updatedAt: dto.updatedAt,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };
  private mapToCartItemResponse = (dto: CartItemData): CartItem => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      createdAt: dto.createdAt,
    };
  };
  private mapToCartItemCourseResponse = (course: CourseData) => {
    return {
      thumbnail: course.thumbnail,
      id: course.id,
      title: course.title,
      rating: course.rating,
      enrollments: course.enrollments,
      price: course.price,
      instructor: {
        id: course.instructor?.id,
        avatar: course.instructor?.avatar,
        name: course.instructor?.name,
        email: course.instructor?.email,
      },
    };
  };
}
