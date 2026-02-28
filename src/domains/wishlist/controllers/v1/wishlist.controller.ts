import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

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
} from '@/domains/service-clients/user/proto/generated/user/types/wishlist_types';
import { toggleWishlistItemSchema } from '../../schemas/toggle-wishlist.schema';
import { attachMetadata } from '../../utils/attach-metadata';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import {
  CourseData,
  CourseMetadata,
} from '@/domains/service-clients/course/proto/generated/course/types/course';
import { WISHLIST_MESSAGES } from '../../utils/response-message';
import { CourseInfo } from '@/domains/course/types';
import { WishlistResponseMapper } from '../../utils/mappers';
import { CourseResponseMapper } from '@/domains/course/utils/mappers';
import { WishlistService } from '@/domains/service-clients/wishlist';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/services/di';

@Observe({ logLevel: 'debug' })
@injectable()
export class WishlistController {
  constructor(
    @inject(TYPES.WishlistService)
    private wishlistServiceClient: WishlistService,
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
    @inject(TYPES.CourseService) private courseServiceClient: CourseService
  ) {
    this.wishlistServiceClient = WishlistService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
  }

  async getUserWishlist(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.params,
        ...req.user,
      },
      getUserWishlistSchema
    )!;

    const { success } = await this.wishlistServiceClient.getUserWishlist(
      {
        userId,
        pagination,
      },
      { metadata: attachMetadata(req) }
    );

    const mappedWishlist = WishlistResponseMapper.toWishlist(
      success!.wishlist!
    );

    const paginationResponse = mapPaginationResponse(
      pagination,
      success?.pagination?.totalItems
    );

    if (
      !mappedWishlist ||
      !mappedWishlist.items ||
      mappedWishlist.items.length === 0
    ) {
      return new ResponseWrapper(res)
        .status(WISHLIST_MESSAGES.EMPTY_WISHLIST.statusCode)
        .success(
          mappedWishlist,
          WISHLIST_MESSAGES.FETCH_USER_WISHLIST.message,
          paginationResponse
        );
    }

    const courseIds = Array.from(
      new Set(mappedWishlist?.items?.map(c => c.courseId!))
    );
    let courseMap: Record<string, CourseInfo> = {};

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
      .status(WISHLIST_MESSAGES.FETCH_USER_WISHLIST.statusCode)
      .success(
        {
          ...success?.wishlist,
          items: success?.wishlist?.items.map(item => ({
            ...item,
            course: courseMap[item.courseId!],
          })),
        },
        WISHLIST_MESSAGES.FETCH_USER_WISHLIST.message,
        paginationResponse
      );
  }

  async getCurrentUserWishlist(req: Request, res: Response) {
    const { userId, pagination } = validateSchema(
      {
        ...req.user,
      },
      getUserWishlistSchema
    )!;

    const { success } = await this.wishlistServiceClient.getUserWishlist(
      {
        userId,
        pagination,
      },
      { metadata: attachMetadata(req) }
    );

    const mappedWishlist = WishlistResponseMapper.toWishlist(
      success!.wishlist!
    );

    const paginationResponse = mapPaginationResponse(
      pagination,
      success?.pagination?.totalItems
    );

    if (
      !mappedWishlist ||
      !mappedWishlist.items ||
      mappedWishlist.items.length === 0
    ) {
      return new ResponseWrapper(res)
        .status(WISHLIST_MESSAGES.EMPTY_WISHLIST.statusCode)
        .success(
          mappedWishlist,
          WISHLIST_MESSAGES.FETCH_USER_WISHLIST.message,
          paginationResponse
        );
    }

    const courseIds = Array.from(
      new Set(mappedWishlist?.items?.map(c => c.courseId!))
    );
    let courseMap: Record<string, CourseInfo> = {};

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
      .status(WISHLIST_MESSAGES.FETCH_USER_WISHLIST.statusCode)
      .success(
        {
          ...success?.wishlist,
          items: success?.wishlist?.items.map(item => ({
            ...item,
            course: courseMap[item.courseId!],
          })),
        },

        WISHLIST_MESSAGES.FETCH_USER_WISHLIST.message,
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

    const { item } = await this.wishlistServiceClient.toggleWishlistItem(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(WISHLIST_MESSAGES.TOGGLE_WISHLIST_ITEM.statusCode)
      .success(
        WishlistResponseMapper.toWishlistItem(item!),
        WISHLIST_MESSAGES.TOGGLE_WISHLIST_ITEM.message
      );
  }

  async removeFromWishlist(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        ...req.query,
        ...req.params,
        ...req.user,
      },
      removeFromWishlistSchema
    )!;

    // Actual call to backend service
    const response = await this.wishlistServiceClient.removeFromWishlist(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    return new ResponseWrapper(res)
      .status(WISHLIST_MESSAGES.REMOVE_FROM_WISHLIST.statusCode)
      .success(
        response.success,
        WISHLIST_MESSAGES.REMOVE_FROM_WISHLIST.message
      );
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

    const { item } = await this.wishlistServiceClient.addToWishlist(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );
    return new ResponseWrapper(res)
      .status(WISHLIST_MESSAGES.ADD_TO_WISHLIST.statusCode)
      .success(item, WISHLIST_MESSAGES.ADD_TO_WISHLIST.message);
  }
}
