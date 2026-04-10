import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { Permissions } from '@/shared/types';
import { MediaController } from '../controllers';
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
  authGuard({
    roles: ['instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(
    medialController.generateCourseUploadSignature.bind(medialController)
  )
);
router.post(
  '/course/secure/signature',
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(
    medialController.generateCourseUploadSecureSignature.bind(medialController)
  )
);
router.post(
  '/course/secure/content',
  authGuard({ permissions: [Permissions.COURSE_VIEW] }),
  asyncHandler(medialController.generateSignedCourseUrl.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/init',
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignInit.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/parts',
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignGetParts.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/complete',
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignComplete.bind(medialController))
);
router.post(
  '/course/secure/signature/multipart/abort',
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignAbort.bind(medialController))
);

export { router as mediaRouterV1 };
