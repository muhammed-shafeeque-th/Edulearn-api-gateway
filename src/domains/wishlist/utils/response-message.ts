import { HttpStatus } from '@/shared/constants/http-status';

export const WISHLIST_MESSAGES = {
  FETCH_USER_WISHLIST: {
    message: 'User wishlist fetched successfully',
    statusCode: HttpStatus.OK,
  },
  TOGGLE_WISHLIST_ITEM: {
    message: 'Wishlist item operation successful',
    statusCode: HttpStatus.CREATED,
  },
  REMOVE_FROM_WISHLIST: {
    message: 'Item removed from wishlist successfully',
    statusCode: HttpStatus.NO_CONTENT,
  },
  ADD_TO_WISHLIST: {
    message: 'Item added to wishlist successfully',
    statusCode: HttpStatus.CREATED,
  },
  EMPTY_WISHLIST: {
    message: 'User wishlist is empty',
    statusCode: HttpStatus.OK,
  },
};
