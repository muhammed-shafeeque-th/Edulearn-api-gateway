import { HttpStatus } from '@/shared/constants/http-status';

export const PAYMENT_MESSAGES = {
  PAYMENT_CREATED: {
    message: 'Payment created successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_VERIFIED: {
    message: 'Payment verified successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_CAPTURED: {
    message: 'Payment captured successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_FETCHED: {
    message: 'Payment fetched successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_CANCELED: {
    message: 'Payment canceled successfully',
    statusCode: HttpStatus.OK,
  },
  INVALID_PAYLOAD: {
    message: 'Invalid request payload.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  PAYMENT_NOT_FOUND: {
    message: 'Payment not found.',
    statusCode: HttpStatus.NOT_FOUND,
  },
  PAYMENT_REFUNDED: {
    message: 'Payment refunded successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_STATUS_UPDATED: {
    message: 'Payment status updated successfully',
    statusCode: HttpStatus.OK,
  },

  // Success Messages
  PAYMENT_INITIATED: {
    message: 'Payment initiated successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_SUCCESS: {
    message: 'Payment completed successfully',
    statusCode: HttpStatus.OK,
  },
  REFUND_INITIATED: {
    message: 'Refund initiated successfully',
    statusCode: HttpStatus.OK,
  },
  REFUND_COMPLETED: {
    message: 'Refund completed successfully',
    statusCode: HttpStatus.OK,
  },
  PAYMENT_METHOD_ADDED: {
    message: 'Payment method added successfully',
    statusCode: HttpStatus.CREATED,
  },
  PAYMENT_METHOD_DELETED: {
    message: 'Payment method deleted successfully',
    statusCode: HttpStatus.OK,
  },

  // Error Messages
  PAYMENT_FAILED: {
    message: 'Payment processing failed',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  INVALID_PAYMENT_METHOD: {
    message: 'Invalid payment method',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  INSUFFICIENT_FUNDS: {
    message: 'Insufficient funds',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  PAYMENT_GATEWAY_ERROR: {
    message: 'Payment gateway error',
    statusCode: HttpStatus.BAD_GATEWAY,
  },
  REFUND_FAILED: {
    message: 'Refund processing failed',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  TRANSACTION_NOT_FOUND: {
    message: 'Transaction not found',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
};
