import {} from '@/shared/utils/async-handler';
import { ChatController } from '../controllers/chat.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';
import { authGuard } from '@/middlewares/auth.middleware';

const router = Router();

const chatController = container.get<ChatController>(TYPES.ChatController);

//  ============================================================================
//                               CHAT ROUTES
//  ============================================================================

router.get('/', chatController.getStudentChats.bind(chatController));
router.get(
  '/instructor',
  authGuard({ roles: ['instructor'] }),
  chatController.getInstructorChats.bind(chatController)
);

router.post('/', chatController.createOrGetChat.bind(chatController));

router.get('/:chatId', chatController.getChat.bind(chatController));

router.delete('/:chatId', chatController.deleteChat.bind(chatController));

router.patch('/:chatId/pin', chatController.pinChat.bind(chatController));
router.patch('/:chatId/unpin', chatController.unPinChat.bind(chatController));
router.patch(
  '/:chatId/archive',
  chatController.archiveChat.bind(chatController)
);
router.patch(
  '/:chatId/unarchive',
  chatController.unArchiveChat.bind(chatController)
);

router.patch(
  '/:chatId/read',
  chatController.markMessagesRead.bind(chatController)
);

router.get(
  '/:chatId/messages',
  chatController.getMessages.bind(chatController)
);

router.post(
  '/:chatId/messages',
  chatController.sendMessage.bind(chatController)
);

router.patch(
  '/:chatId/messages/:messageId',
  chatController.editMessage.bind(chatController)
);

router.delete(
  '/:chatId/messages/:messageId',
  chatController.deleteMessage.bind(chatController)
);

router.post(
  '/:chatId/messages/:messageId/reactions',
  chatController.reactMessage.bind(chatController)
);
router.delete(
  '/:chatId/messages/:messageId/reactions/:reactionId',
  chatController.removeReaction.bind(chatController)
);

export { router as chatRoutesV1 };
