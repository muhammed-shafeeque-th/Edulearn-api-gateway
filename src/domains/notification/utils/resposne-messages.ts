import { HttpStatus } from '@/shared/constants/http-status';

// Response messages for Notification endpoints
export const NOTIFICATION_MESSAGES = {
  FETCH_NOTIFICATIONS: {
    message: 'Fetched notifications successfully.',
    statusCode: HttpStatus.OK,
  },
  FETCH_NOTIFICATION: {
    message: 'Fetched notification successfully.',
    statusCode: HttpStatus.OK,
  },
  MARK_ALL_AS_READ: {
    message: 'Marked all notifications as read successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  MARK_AS_READ: {
    message: 'Marked notification as read successfully.',
    statusCode: HttpStatus.CREATED,
  },
  DELETE_NOTIFICATION: {
    message: 'Deleted notification successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
  CLEAR_USER_NOTIFICATIONS: {
    message: 'Cleared user notifications successfully.',
    statusCode: HttpStatus.NO_CONTENT,
  },
};
