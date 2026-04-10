import { HttpStatus } from '@/shared/constants/http-status';

export const CART_MESSAGES = {
  GET_USER_CART_SUCCESS: {
    message:
      "User cart fetched successfully. All items currently in the user's cart are listed, including details on each course.",
    statusCode: HttpStatus.OK,
  },
  GET_USER_CART_EMPTY: {
    message: "User cart is empty. No items were found in the user's cart.",
    statusCode: HttpStatus.OK,
  },
  ADD_TO_CART_SUCCESS: {
    message:
      'Item added to cart successfully. The selected course has been placed into your cart.',
    statusCode: HttpStatus.CREATED,
  },
  ADD_TO_CART_ALREADY_EXISTS: {
    message: 'The item is already in the cart. No duplicate action was taken.',
    statusCode: HttpStatus.OK,
  },
  REMOVE_FROM_CART_SUCCESS: {
    message:
      'Item removed from cart successfully. The specified course has been deleted from your cart.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  REMOVE_FROM_CART_NOT_FOUND: {
    message: 'The item you attempted to remove does not exist in the cart.',
    statusCode: HttpStatus.NOT_FOUND,
  },
  TOGGLE_CART_ITEM_SUCCESS: {
    message:
      'Cart item toggled successfully. The item was either added to or removed from the cart, depending on its previous state.',
    statusCode: HttpStatus.OK,
  },
  CART_ITEM_NOT_FOUND: {
    message: 'The specified cart item was not found.',
    statusCode: HttpStatus.NOT_FOUND,
  },
  CART_ITEM_ADD_FAILED: {
    message:
      'Failed to add item to cart. Please check that the course exists and try again.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  CART_ITEM_REMOVE_FAILED: {
    message:
      'Failed to remove item from cart. Please ensure the item is in your cart before attempting removal.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  CART_OPERATION_UNAUTHORIZED: {
    message: 'You are not authorized to perform this operation on the cart.',
    statusCode: HttpStatus.FORBIDDEN,
  },
  CART_GENERAL_ERROR: {
    message: 'An unexpected error occurred during the cart operation.',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
