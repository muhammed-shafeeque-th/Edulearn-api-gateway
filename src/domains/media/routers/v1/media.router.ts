import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { MediaService } from '../../controllers/v1/media.controller';

const router = Router();

const medialController = new MediaService();

router.post(
  '/avatar/signature',
  authenticate,
  asyncHandler(
    medialController.getPreSignedAvatarUploadUrl.bind(medialController)
  )
);
router.post(
  '/course/signature',
  authenticate,
  asyncHandler(
    medialController.getPreSignedCourseUploadUrl.bind(medialController)
  )
);
router.post(
  '/course/secure/signature',
  authenticate,
  asyncHandler(
    medialController.getPreSignedCourseSecureUploadUrl.bind(medialController)
  )
);
router.post(
  '/course/secure/content',
  authenticate,
  asyncHandler(
    medialController.getSecureSignedCourseUrl.bind(medialController)
  )
);
router.post(
  '/course/secure/signature/multipart/init',
  authenticate,
  asyncHandler(medialController.multipartSignInit.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/parts',
  authenticate,
  asyncHandler(medialController.multipartSignGetParts.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/complete',
  authenticate,
  asyncHandler(medialController.multipartSignComplete.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/abort',
  authenticate,
  asyncHandler(medialController.multipartSignAbort.bind(medialController))
);

export { router as mediaRouter };
