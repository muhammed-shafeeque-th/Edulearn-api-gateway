import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { HttpStatus } from '@/shared/constants/http-status';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { getUserWishlistSchema } from '../../schemas/get-user-wishlist.schema';
import { Wishlist, WishlistItem } from '../../types';
import { addToWishlistSchema } from '../../schemas/add-to-wishlist.schema';
import { removeFromWishlistSchema } from '../../schemas/remove-from-wishlist.schema';
import {
  WishlistData,
  WishlistItemData,
} from '@/domains/service-clients/user/proto/generated/user_service';
import { toggleWishlistItemSchema } from '../../schemas/toggle-wishlist.schema';
import { CourseData } from '@/domains/service-clients/course/proto/generated/course_service';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';

@Observe({ logLevel: 'debug' })
export class WishlistController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private courseServiceClient: CourseService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
  }

  async getUserWishlist(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      getUserWishlistSchema
    )!;

    const { success } = await this.userServiceClient.getUserWishlist(
      {
        userId,
        pagination,
      },
      { attachMetadata: attachMetadata(req) }
    );
    const mappedWishlist = this.mapToWishlistResponse(success!.wishlist!);

    const paginationResponse = mapPaginationResponse(
      pagination,
      mappedWishlist?.total
    );

    if (
      !mappedWishlist ||
      !mappedWishlist.items ||
      mappedWishlist.items.length === 0
    ) {
      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(
          mappedWishlist,
          'User wishlist fetched successfully',
          paginationResponse
        );
    }

    const courseIds = Array.from(
      new Set(mappedWishlist?.items?.map(c => c.courseId!))
    );
    let courseMap: Record<string, any> = {};

    const { success: courseResponse } =
      await this.courseServiceClient.getCoursesByIds({
        courseIds,
      });

    courseMap = courseResponse?.courses?.courses.reduce(
      (accMap: typeof courseMap, course) => {
        accMap[course.id] = this.mapToWishlistItemCourseResponse(course);
        return accMap;
      },
      {}
    )!;

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        ...success?.wishlist,
        items: success?.wishlist?.items.map(item => ({
          ...item,
          course: courseMap[item.courseId!],
        })),
      },
      'User wishlist fetched successfully',
      paginationResponse
    );

    // return new ResponseWrapper(res)
    //   .status(HttpStatus.OK)
    //   .success(
    //     success?.transactions.map(this.mapToWishlistResponse),
    //     'User wishlist fetched successfully'
    //   );
  }
  async getCurrentUserWishlist(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.body,
        ...req.user,
      },
      getUserWishlistSchema
    )!;

    const { success } = await this.userServiceClient.getUserWishlist(
      {
        userId,
        pagination,
      },
      { attachMetadata: attachMetadata(req) }
    );

    const mappedWishlist = this.mapToWishlistResponse(success!.wishlist!);

    const paginationResponse = mapPaginationResponse(
      pagination,
      mappedWishlist?.total
    );

    if (
      !mappedWishlist ||
      !mappedWishlist.items ||
      mappedWishlist.items.length === 0
    ) {
      return new ResponseWrapper(res)
        .status(HttpStatus.OK)
        .success(
          mappedWishlist,
          'User wishlist fetched successfully',
          paginationResponse
        );
    }

    const courseIds = Array.from(
      new Set(mappedWishlist?.items?.map(c => c.courseId!))
    );
    let courseMap: Record<string, any> = {};

    const { success: courseResponse } =
      await this.courseServiceClient.getCoursesByIds({
        courseIds,
      });

    courseMap = courseResponse?.courses?.courses.reduce(
      (accMap: typeof courseMap, course) => {
        accMap[course.id] = this.mapToWishlistItemCourseResponse(course);
        return accMap;
      },
      {}
    )!;

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        ...success?.wishlist,
        items: success?.wishlist?.items.map(item => ({
          ...item,
          course: courseMap[item.courseId!],
        })),
      },

      'User wishlist fetched successfully',
      paginationResponse
    );
  }

  async toggleWishlistItem(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      toggleWishlistItemSchema
    )!;

    const { item } = await this.userServiceClient.toggleWishlistItem(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.CREATED)
      .success(this.mapToWishlistItemResponse(item!), 'operation successful');
  }

  async removeFromWishlist(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      removeFromWishlistSchema
    )!;

    const { success } = await this.userServiceClient.removeFromWishlist(
      validPayload,
      {
        attachMetadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res).status(HttpStatus.NO_CONTENT);
  }
  async addToWishlist(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.body,
        ...req.params,
        ...req.user,
      },
      addToWishlistSchema
    )!;

    const { item } = await this.userServiceClient.addToWishlist(validPayload, {
      attachMetadata: attachMetadata(req),
    });

    return new ResponseWrapper(res).status(HttpStatus.NO_CONTENT);
  }

  // Mapping Functions
  private mapToWishlistResponse = (dto: WishlistData): Wishlist | undefined => {
    if (!dto) return;
    return {
      id: dto.id,
      total: dto.total,
      items: dto.items.map(this.mapToWishlistItemResponse),
      updatedAt: dto.updatedAt,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };
  private mapToWishlistItemResponse = (dto: WishlistItemData): WishlistItem => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      createdAt: dto.createdAt,
    };
  };
  private mapToWishlistItemCourseResponse = (course: CourseData) => {
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
