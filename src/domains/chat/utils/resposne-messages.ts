import { HttpStatus } from '@/shared/constants/http-status';
// --- ChatMessages types (for status and message) ---
export const CHAT_MESSAGES = {
  CREATE_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.CREATED,
    message: 'Conversation created successfully',
  },
  GET_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Conversation fetched successfully',
  },
  GET_USER_CONVERSATIONS_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'User conversations fetched successfully',
  },
  PIN_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Conversation pinned successfully',
  },
  UNPIN_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Conversation unpinned successfully',
  },
  DELETE_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Conversation deleted successfully',
  },
  ARCHIVE_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Conversation archived successfully',
  },
  UNARCHIVE_CONVERSATION_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Conversation unarchived successfully',
  },
  GET_MESSAGES_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Messages fetched successfully',
  },
  SEND_MESSAGE_SUCCESS: {
    statusCode: HttpStatus.CREATED,
    message: 'Message sent successfully',
  },
  EDIT_MESSAGE_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Message updated successfully',
  },
  MARK_MESSAGES_READ_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Messages marked as read',
  },
  DELETE_MESSAGE_SUCCESS: {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Message deleted successfully',
  },
  REMOVE_REACTION_SUCCESS: {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Reaction removed from message',
  },
  ADD_REACTION_SUCCESS: {
    statusCode: HttpStatus.OK,
    message: 'Reaction added to message',
  },
};
