import { asyncHandler } from '@/shared/utils/async-handler';
import { DiscussionController } from '../controllers/discussion.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';
import { authGuard } from '@/middlewares/auth.middleware';

const router = Router();

const discussionController = container.get<DiscussionController>(
  TYPES.DiscussionController
);

//  ============================================================================
//                           DISCUSSION ROUTES
//  ============================================================================

// Create or get a discussion room for a course
router.post(
  '/rooms',
  authGuard(),
  asyncHandler(discussionController.createOrGetRoom.bind(discussionController))
);

// Send a message to a discussion room
router.post(
  '/rooms/:roomId/messages',
  authGuard(),
  asyncHandler(discussionController.sendMessage.bind(discussionController))
);

// Get paginated messages from a discussion room
router.get(
  '/rooms/:roomId/messages',
  authGuard(),
  asyncHandler(discussionController.getMessages.bind(discussionController))
);

export { router as discussionRoutesV1 };
