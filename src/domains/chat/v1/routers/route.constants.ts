export const chatEndpoints = {
  base: '/',
  instructor: '/instructor',
  chat: '/:chatId',
  pin: '/:chatId/pin',
  unpin: '/:chatId/unpin',
  archive: '/:chatId/archive',
  unarchive: '/:chatId/unarchive',
  read: '/:chatId/read',
  messages: '/:chatId/messages',
  message: '/:chatId/messages/:messageId',
  reactions: '/:chatId/messages/:messageId/reactions',
  reaction: '/:chatId/messages/:messageId/reactions/:reactionId',
};

export const discussionEndpoints = {
  rooms: '/rooms',
  messages: '/rooms/:roomId/messages',
};
