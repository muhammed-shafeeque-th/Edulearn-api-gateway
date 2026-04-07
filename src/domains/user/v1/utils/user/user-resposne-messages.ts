import { HttpStatus } from '@/shared/constants/http-status';

// User response messages object
export const USER_MESSAGES = {
  USER_BLOCKED: {
    message: 'User has been blocked successfully',
    statusCode: HttpStatus.OK,
  },
  USER_UNBLOCKED: {
    message: 'User has been unblocked successfully',
    statusCode: HttpStatus.OK,
  },
  USER_FETCHED: {
    message: 'Fetched user data successfully',
    statusCode: HttpStatus.OK,
  },
  CURRENT_USER_FETCHED: {
    message: 'Fetched current user data successfully',
    statusCode: HttpStatus.OK,
  },
  USERS_FETCHED: {
    message: 'User response fetched successfully',
    statusCode: HttpStatus.OK,
  },
  USER_UPDATED: {
    message: 'User data updated successfully',
    statusCode: HttpStatus.OK,
  },
  INSTRUCTOR_REGISTERED: {
    message: 'User data updated successfully',
    statusCode: HttpStatus.OK,
  },
  PROFILE_FETCHED: {
    message: 'Profile fetched successfully',
    statusCode: HttpStatus.OK,
  },
  PROFILE_UPDATED: {
    message: 'Profile updated successfully',
    statusCode: HttpStatus.OK,
  },
  PROFILE_DELETED: {
    message: 'Profile deleted successfully',
    statusCode: HttpStatus.OK,
  },
  AVATAR_UPLOADED: {
    message: 'Avatar uploaded successfully',
    statusCode: HttpStatus.OK,
  },
  PASSWORD_CHANGED: {
    message: 'Password changed successfully',
    statusCode: HttpStatus.OK,
  },
  PREFERENCES_UPDATED: {
    message: 'Preferences updated successfully',
    statusCode: HttpStatus.OK,
  },

  // Error Messages
  USER_NOT_FOUND: {
    message: 'User not found',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  INVALID_USER_DATA: {
    message: 'Invalid user data provided',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  CURRENT_PASSWORD_INCORRECT: {
    message: 'Current password is incorrect',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  FILE_UPLOAD_FAILED: {
    message: 'File upload failed',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INVALID_FILE_TYPE: {
    message: 'Invalid file type',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};
