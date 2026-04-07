import { HttpStatus } from '@/shared/constants/http-status';
import { Http } from 'winston/lib/winston/transports';
/**
 * Standardized response messages for all order-related endpoints.
 * Define messages and HTTP status codes here, and refer to these constants throughout the controller.
 */
export const ORDER_MESSAGES = {
  ORDER_PLACED: {
    message: 'Order has been placed successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_FETCHED: {
    message: 'Order details fetched successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDERS_FETCHED: {
    message: 'Orders fetched successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_STATUS_FETCHED: {
    message: 'Order status fetched successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_UPDATED: {
    message: 'Order updated successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_DELETED: {
    message: 'Order deleted successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  ORDER_PAYMENT_STATUS_FETCHED: {
    message: 'Order payment status fetched successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_ITEM_ADDED: {
    message: 'Order item added successfully.',
    statusCode: HttpStatus.CREATED,
  },
  ORDER_ITEM_REMOVED: {
    message: 'Order item removed successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_ITEM_UPDATED: {
    message: 'Order item updated successfully.',
    statusCode: HttpStatus.OK,
  },
  ORDER_NOT_FOUND: {
    message: 'Order not found.',
    statusCode: HttpStatus.NOT_FOUND,
  },
  INVALID_PAYLOAD: {
    message: 'Invalid request payload.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  // For future endpoints
  ORDER_STATUS_UPDATED: {
    message: 'Order status updated successfully.',
    statusCode: HttpStatus.OK,
  },
  // etc...
};