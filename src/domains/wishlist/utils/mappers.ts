import {
  WishlistData,
  WishlistItemData,
} from '@/domains/service-clients/user/proto/generated/user/types/wishlist_types';
import { Wishlist, WishlistItem } from '../types';

export class WishlistResponseMapper {
  public static toWishlist = (dto: WishlistData): Wishlist | undefined => {
    if (!dto) return;
    return {
      id: dto.id,
      total: dto.total,
      items: dto.items.map(this.toWishlistItem),
      updatedAt: dto.updatedAt,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };
  public static toWishlistItem = (dto: WishlistItemData): WishlistItem => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      createdAt: dto.createdAt,
    };
  };
}
