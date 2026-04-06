import { HttpStatus } from '@/shared/constants/http-status';

export const ADMIN_MESSAGES = {
  LOGIN_SUCCESS: {
    message: 'User logged in successfully',
    statusCode: HttpStatus.OK,
  },
  LOGIN_INVALID: {
    message: 'Invalid login credentials',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  REFRESH_SUCCESS: {
    message: 'Token refreshed successfully',
    statusCode: HttpStatus.OK,
  },
  REFRESH_INVALID: {
    message: 'Invalid refresh token',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  USER_BLOCK_SUCCESS: {
    message: 'User has been blocked successfully',
    statusCode: HttpStatus.OK,
  },
  USER_UNBLOCK_SUCCESS: {
    message: 'User has been unblocked successfully',
    statusCode: HttpStatus.OK,
  },
  USER_NOT_FOUND: {
    message: 'User not found',
    statusCode: HttpStatus.NOT_FOUND,
  },
  USER_DATA_UPDATED: {
    message: 'User data updated successfully',
    statusCode: HttpStatus.OK,
  },
  INSTRUCTORS_FETCH_SUCCESS: {
    message: 'Instructors fetched successfully',
    statusCode: HttpStatus.OK,
  },
  SERVER_ERROR: {
    message: 'An unexpected error occurred',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};