import { HttpStatus } from '@/shared/constants/http-status';

export const DISCUSSION_MESSAGES = {
  CREATE_ROOM_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Discussion room fetched successfully',
  },
  SEND_MESSAGE_SUCCESS: {
    statusCode: HttpStatus.CREATED,
    message: 'Discussion message sent successfully',
  },
  GET_MESSAGES_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Discussion messages fetched successfully',
  },
};
