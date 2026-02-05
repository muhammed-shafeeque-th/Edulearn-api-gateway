import { HttpStatus } from '@/shared/constants/http-status';

export const MEDIA_MESSAGES = {
  GENERATED_AVATAR_UPLOAD_URL: {
    message: 'Generated signed avatar upload url successfully',
    statusCode: HttpStatus.OK,
  },
  GENERATED_COURSE_UPLOAD_URL: {
    message: 'Generated signed course upload url successfully',
    statusCode: HttpStatus.OK,
  },
  GENERATED_COURSE_UPLOAD_SECURE_URL: {
    message: 'Generated secure signed course upload url successfully',
    statusCode: HttpStatus.OK,
  },
  GENERATED_SIGNED_COURSE_URL: {
    message: 'Generated signed course url successfully',
    statusCode: HttpStatus.OK,
  },
  MULTIPART_SIGN_INIT: {
    message: 'Multipart upload initialized successfully',
    statusCode: HttpStatus.OK,
  },
  MULTIPART_SIGN_COMPLETE: {
    message: 'Multipart upload completed successfully',
    statusCode: HttpStatus.OK,
  },
  MULTIPART_SIGN_PARTS: {
    message: 'Multipart upload part URLs retrieved successfully',
    statusCode: HttpStatus.OK,
  },
  MULTIPART_SIGN_ABORT: {
    message: 'Multipart upload aborted successfully',
    statusCode: HttpStatus.OK,
  },
};
