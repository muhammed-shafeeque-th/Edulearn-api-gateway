import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { MediaController } from '../../controllers/v1/media.controller';
import { container, TYPES } from '@/services/di';

const router = Router();

const medialController = container.get<MediaController>(TYPES.MediaController);

router.post(
  '/avatar/signature',
  asyncHandler(
    medialController.generateAvatarUpdateSignature.bind(medialController)
  )
);
router.post(
  '/course/signature',
  asyncHandler(
    medialController.generateCourseUploadSignature.bind(medialController)
  )
);
router.post(
  '/course/secure/signature',
  asyncHandler(
    medialController.generateCourseUploadSecureSignature.bind(medialController)
  )
);
router.post(
  '/course/secure/content',
  asyncHandler(medialController.generateSignedCourseUrl.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/init',
  asyncHandler(medialController.multipartSignInit.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/parts',
  asyncHandler(medialController.multipartSignGetParts.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/complete',
  asyncHandler(medialController.multipartSignComplete.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/abort',
  asyncHandler(medialController.multipartSignAbort.bind(medialController))
);

export { router as mediaRoutesV1 };
