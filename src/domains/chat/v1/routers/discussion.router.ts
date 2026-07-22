import { asyncHandler } from '@/shared/utils/async-handler';
import { DiscussionController } from '../controllers/discussion.controller';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { authGuard } from '@/middlewares/auth.middleware';
import { discussionEndpoints } from './route.constants';

const router = Router();

const discussionController = container.get<DiscussionController>(
  TYPES.DiscussionController
);

//  ============================================================================
//                           DISCUSSION ROUTES
//  ============================================================================

router.post(
  discussionEndpoints.rooms,
  authGuard(),
  asyncHandler(discussionController.createOrGetRoom.bind(discussionController))
);

router.post(
  discussionEndpoints.messages,
  authGuard(),
  asyncHandler(discussionController.sendMessage.bind(discussionController))
);

router.get(
  discussionEndpoints.messages,
  authGuard(),
  asyncHandler(discussionController.getMessages.bind(discussionController))
);

export { router as discussionRoutesV1 };
