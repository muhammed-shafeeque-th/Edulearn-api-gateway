import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { ChatController } from '../../controllers/v1/chat.controller';
import { Router } from 'express';

const router = Router();

const chatController = new ChatController();

//  ============================================================================
//                               CHAT ROUTES
//  ============================================================================

router.get(
  '/',
  asyncHandler(chatController.getUserConversations.bind(chatController))
);

router.get(
  '/:chatId/messages',
  asyncHandler(chatController.getMessages.bind(chatController))
);

router.get(
  '/:chatId',
  asyncHandler(chatController.getConversation.bind(chatController))
);

router.post(
  '/:chatId/messages',
  asyncHandler(chatController.sendMessage.bind(chatController))
);
router.patch(
  '/:chatId/messages/:messageId',
  asyncHandler(chatController.editMessage.bind(chatController))
);

router.delete(
  '/:chatId/messages/:messageId',
  asyncHandler(chatController.deleteMessage.bind(chatController))
);

router.post(
  '/:chatId/messages/:messageId/reactions',
  asyncHandler(chatController.reactMessage.bind(chatController))
);
router.delete(
  '/:chatId/messages/:messageId/reactions/:reactionId',
  asyncHandler(chatController.deleteMessage.bind(chatController))
);

router.post(
  '/',
  asyncHandler(chatController.createConversation.bind(chatController))
);

router.patch(
  '/:chatId/pin',
  asyncHandler(chatController.pinConversation.bind(chatController))
);
router.patch(
  '/:chatId/unpin',
  asyncHandler(chatController.unPinConversation.bind(chatController))
);
router.patch(
  '/:chatId/archive',
  asyncHandler(chatController.archiveConversation.bind(chatController))
);
router.patch(
  '/:chatId/unarchive',
  asyncHandler(chatController.unArchiveConversation.bind(chatController))
);
router.delete(
  '/:chatId',
  asyncHandler(chatController.deleteConversation.bind(chatController))
);

export { router as chatRoutesV1 };
