import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { LoggingService } from 'services/observability/logging/logging.service';
import { TracingService } from 'services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';
import { HttpStatus } from '@/shared/constants/http-status';
import { avatarPresignedSchema } from '../../schemas/avatar.presigned.schema';
import { courseUploadPreSignSchema } from '../../schemas/course-presign.schema';
import { getCoursePreSignSchema } from '../../schemas/get-course-presign.schema';
import { CloudinaryMediaService } from '@/services/media/media.service';
import {
  s3StorageService,
  S3StorageService,
} from '@/services/media/storage.service';
import { MEDIA_MESSAGES } from '../../utils/response-messages';
import { inject, injectable } from 'inversify';
import { Trace } from '@/shared/utils/decorators';
import { TYPES } from '@/services/di';

@injectable()
export class MediaController {
  private mediaService: CloudinaryMediaService;
  private storageService: S3StorageService;

  constructor(@inject(TYPES.LoggingService) private logger: LoggingService) {
    // Business services
    this.mediaService = new CloudinaryMediaService();
    this.storageService = s3StorageService;
  }
  @Trace('CourseController.generateAvatarUpdateSignature')
  async generateAvatarUpdateSignature(req: Request, res: Response) {
    this.logger.info(`Processing  method 'generateAvatarUpdateSignature'`);

    const { uploadType, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      avatarPresignedSchema
    )!;

    const response = this.mediaService.getSignedUploadUrl(uploadType, userId);

    this.logger.info('getSignedUploadUrl execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.GENERATED_AVATAR_UPLOAD_URL.statusCode)
      .success(response, MEDIA_MESSAGES.GENERATED_AVATAR_UPLOAD_URL.message);
  }

  @Trace('CourseController.generateCourseUploadSignature')
  async generateCourseUploadSignature(req: Request, res: Response) {
    this.logger.info(`Processing  method 'generateCourseUploadSignature'`);

    const validPayload = validateSchema(
      { ...req.body, userId: req.user?.userId },
      courseUploadPreSignSchema
    )!;

    const response =
      await this.storageService.generatePresignedUploadUrl(validPayload);

    this.logger.info('generateCourseUploadSignature execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.GENERATED_COURSE_UPLOAD_URL.statusCode)
      .success(response, MEDIA_MESSAGES.GENERATED_COURSE_UPLOAD_URL.message);
  }

  @Trace('CourseController.generateCourseUploadSecureSignature')
  async generateCourseUploadSecureSignature(req: Request, res: Response) {
    this.logger.info(
      `Processing  method 'generateCourseUploadSecureSignature'`
    );

    const validPayload = validateSchema(
      { ...req.body, userId: req.user?.userId },
      courseUploadPreSignSchema
    )!;

    const response =
      await this.storageService.generateSecurePresignedUploadUrl(validPayload);

    this.logger.info(
      'generateCourseUploadSecureSignature execution has completed '
    );

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.GENERATED_COURSE_UPLOAD_SECURE_URL.statusCode)
      .success(
        response,
        MEDIA_MESSAGES.GENERATED_COURSE_UPLOAD_SECURE_URL.message
      );
  }

  @Trace('CourseController.generateSignedCourseUrl')
  async generateSignedCourseUrl(req: Request, res: Response) {
    this.logger.info(`Processing  method 'generateSignedCourseUrl'`);

    const { key } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      getCoursePreSignSchema
    )!;

    const response = await this.storageService.getSignedSecureCourseUrl(key);

    this.logger.info('generateSignedCourseUrl execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.GENERATED_SIGNED_COURSE_URL.statusCode)
      .success(response, MEDIA_MESSAGES.GENERATED_SIGNED_COURSE_URL.message);
  }

  @Trace('CourseController.multipartSignInit')
  async multipartSignInit(req: Request, res: Response) {
    this.logger.info(`Processing  method 'getSignedUploadUrl'`);

    const { uploadType, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      avatarPresignedSchema
    )!;

    /**
           * return this.storage.createMultipartUpload({
    filename: dto.filename,
    contentType: dto.contentType,
    size: dto.size,
    courseId: dto.courseId,
    userId: req.user.id,
  });
           */

    const response = this.mediaService.getSignedUploadUrl(uploadType, userId);

    this.logger.info('getSignedUploadUrl execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.MULTIPART_SIGN_INIT.statusCode)
      .success(response, MEDIA_MESSAGES.MULTIPART_SIGN_INIT.message);
  }

  @Trace('CourseController.multipartSignComplete')
  async multipartSignComplete(req: Request, res: Response) {
    this.logger.info(`Processing  method 'getSignedUploadUrl'`);

    const { uploadType, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      avatarPresignedSchema
    )!;

    /**
           return this.storage.completeMultipartUpload(dto.key, dto.uploadId, dto.parts);
           */

    const response = this.mediaService.getSignedUploadUrl(uploadType, userId);

    this.logger.info('getSignedUploadUrl execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.MULTIPART_SIGN_COMPLETE.statusCode)
      .success(response, MEDIA_MESSAGES.MULTIPART_SIGN_COMPLETE.message);
  }

  @Trace('CourseController.multipartSignGetParts')
  async multipartSignGetParts(req: Request, res: Response) {
    this.logger.info(`Processing  method 'getSignedUploadUrl'`);

    const { uploadType, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      avatarPresignedSchema
    )!;

    /**
            return this.storage.getMultipartPartUrls(dto.key, dto.uploadId, dto.partNumbers);
           */

    const response = this.mediaService.getSignedUploadUrl(uploadType, userId);

    this.logger.info('getSignedUploadUrl execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.MULTIPART_SIGN_PARTS.statusCode)
      .success(response, MEDIA_MESSAGES.MULTIPART_SIGN_PARTS.message);
  }

  @Trace('CourseController.multipartSignAbort')
  async multipartSignAbort(req: Request, res: Response) {
    this.logger.info(`Processing  method 'getSignedUploadUrl'`);

    const { uploadType, userId } = validateSchema(
      { ...req.body, userId: req.user?.userId },
      avatarPresignedSchema
    )!;

    /**
             return this.storage.abortMultipartUpload(body.key, body.uploadId);
           */

    const response = this.mediaService.getSignedUploadUrl(uploadType, userId);

    this.logger.info('getSignedUploadUrl execution has completed ');

    return new ResponseWrapper(res)
      .status(MEDIA_MESSAGES.MULTIPART_SIGN_ABORT.statusCode)
      .success(response, MEDIA_MESSAGES.MULTIPART_SIGN_ABORT.message);
  }
}
