import {} from '@/shared/utils/async-handler';
import { ChatController } from '../controllers/chat.controller';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { authGuard } from '@/middlewares/auth.middleware';
import { chatEndpoints } from './route.constants';

const router = Router();

const chatController = container.get<ChatController>(TYPES.ChatController);

//  ============================================================================
//                               CHAT ROUTES
//  ============================================================================

router.get(
  chatEndpoints.base,
  chatController.getStudentChats.bind(chatController)
);
router.get(
  chatEndpoints.instructor,
  authGuard({ roles: ['instructor'] }),
  chatController.getInstructorChats.bind(chatController)
);

router.post(
  chatEndpoints.base,
  chatController.createOrGetChat.bind(chatController)
);

router.get(chatEndpoints.chat, chatController.getChat.bind(chatController));

router.delete(
  chatEndpoints.chat,
  chatController.deleteChat.bind(chatController)
);

router.patch(chatEndpoints.pin, chatController.pinChat.bind(chatController));
router.patch(
  chatEndpoints.unpin,
  chatController.unPinChat.bind(chatController)
);
router.patch(
  chatEndpoints.archive,
  chatController.archiveChat.bind(chatController)
);
router.patch(
  chatEndpoints.unarchive,
  chatController.unArchiveChat.bind(chatController)
);

router.patch(
  chatEndpoints.read,
  chatController.markMessagesRead.bind(chatController)
);

router.get(
  chatEndpoints.messages,
  chatController.getMessages.bind(chatController)
);

router.post(
  chatEndpoints.messages,
  chatController.sendMessage.bind(chatController)
);

router.patch(
  chatEndpoints.message,
  chatController.editMessage.bind(chatController)
);

router.delete(
  chatEndpoints.message,
  chatController.deleteMessage.bind(chatController)
);

router.post(
  chatEndpoints.reactions,
  chatController.reactMessage.bind(chatController)
);
router.delete(
  chatEndpoints.reaction,
  chatController.removeReaction.bind(chatController)
);

export { router as chatRoutesV1 };
