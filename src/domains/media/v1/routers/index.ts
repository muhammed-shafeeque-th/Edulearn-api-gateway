import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { Permissions } from '@/shared/types';
import { MediaController } from '../controllers';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { mediaEndpoints } from './route.constants';

const router = Router();

const medialController = container.get<MediaController>(TYPES.MediaController);

router.post(
  mediaEndpoints.avatarSignature,
  asyncHandler(
    medialController.generateAvatarUpdateSignature.bind(medialController)
  )
);
router.post(
  mediaEndpoints.courseSignature,
  authGuard({
    roles: ['instructor'],
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(
    medialController.generateCourseUploadSignature.bind(medialController)
  )
);
router.post(
  mediaEndpoints.secureCourseSignature,
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(
    medialController.generateCourseUploadSecureSignature.bind(medialController)
  )
);
router.post(
  mediaEndpoints.viewSecureContent,
  authGuard({ permissions: [Permissions.COURSE_VIEW] }),
  asyncHandler(medialController.generateSignedCourseUrl.bind(medialController))
);
router.post(
  mediaEndpoints.multipartInit,
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignInit.bind(medialController))
);
router.post(
  mediaEndpoints.multipartParts,
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignGetParts.bind(medialController))
);
router.post(
  mediaEndpoints.multipartComplete,
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignComplete.bind(medialController))
);
router.post(
  mediaEndpoints.multipartAbort,
  authGuard({
    permissions: [Permissions.COURSE_CONTENT_MANAGE],
  }),
  asyncHandler(medialController.multipartSignAbort.bind(medialController))
);

export { router as mediaRouterV1 };
