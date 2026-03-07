import { asyncHandler } from '@/shared/utils/async-handler';
import { ChatController } from '../../controllers/v1/chat.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const chatController = container.get<ChatController>(TYPES.ChatController);

//  ============================================================================
//                               CHAT ROUTES
//  ============================================================================

router.get('/', asyncHandler(chatController.getChats.bind(chatController)));

router.post(
  '/',
  asyncHandler(chatController.createOrGetChat.bind(chatController))
);

router.get(
  '/:chatId',
  asyncHandler(chatController.getChat.bind(chatController))
);

router.delete(
  '/:chatId',
  asyncHandler(chatController.deleteChat.bind(chatController))
);

router.patch(
  '/:chatId/pin',
  asyncHandler(chatController.pinChat.bind(chatController))
);
router.patch(
  '/:chatId/unpin',
  asyncHandler(chatController.unPinChat.bind(chatController))
);
router.patch(
  '/:chatId/archive',
  asyncHandler(chatController.archiveChat.bind(chatController))
);
router.patch(
  '/:chatId/unarchive',
  asyncHandler(chatController.unArchiveChat.bind(chatController))
);

router.patch(
  '/:chatId/read',
  asyncHandler(chatController.markMessagesRead.bind(chatController))
);

router.get(
  '/:chatId/messages',
  asyncHandler(chatController.getMessages.bind(chatController))
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
  asyncHandler(chatController.removeReaction.bind(chatController))
);

export { router as chatRoutesV1 };
