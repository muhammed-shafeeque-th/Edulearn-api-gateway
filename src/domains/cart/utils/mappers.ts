import {
  CartData,
  CartItemData,
} from '@/domains/service-clients/user/proto/generated/user/types/cart_types';
import { Cart, CartItem } from '../types';

export class CartResponseMapper {
  // Mapping Functions
  public static toCart = (dto: CartData): Cart | undefined => {
    if (!dto) return;
    return {
      id: dto.id,
      total: dto.total,
      items: dto.items.map(CartResponseMapper.toCartItem),
      updatedAt: dto.updatedAt,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };
  public static toCartItem = (dto: CartItemData): CartItem => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      createdAt: dto.createdAt,
    };
  };
}
