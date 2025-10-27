import { BaseError } from './base-error';
import {
  Error,
  ErrorDetail,
} from '@/domains/service-clients/user/proto/generated/user_service';
import { ErrorStatusCodes } from './error-status-codes';

export class GrpcResponseError extends BaseError {
  public statusCode: ErrorStatusCodes;
  public errorCode: string;
  public details: ErrorDetail[];
  public constructor(error: Error) {
    super(error.message || 'Unknown gRPC response error');
    this.errorCode = error.code || 'GRPC_RESPONSE_ERROR';
    this.statusCode = this.mapErrorCodeToHttpStatus(this.errorCode);
    this.details = Array.isArray(error.details)
      ? error.details
      : [{ message: error.message || 'Unknown error' }];

    Object.setPrototypeOf(this, new.target.prototype);
  }

  private mapErrorCodeToHttpStatus(errorCode: string): ErrorStatusCodes {
    const lowerErrorCode = errorCode.toLowerCase();

    if (["invalid", "invalid"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.BAD_REQUEST; // 400
    }
    if (["notfound", "not_found"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.NOT_FOUND; // 404
    }
    if (["alreadyexist", "already_exist"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.CONFLICT; // 409
    }
    if (["permissiondenied", "permission_denied"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.PERMISSION_DENIED; // 403
    }
    if (["unauthenticated", "unauthenticated"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.UNAUTHORIZED; // 401
    }
    if (["failed_precondition", "failed_precondition"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.PRECONDITION_FAILED; // 412
    }
    if (["resource_exhausted", "resource_exhausted"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.TOO_MANY_REQUESTS; // 429
    }
    if (["unavailable", "unavailable"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.UNAVAILABLE; // 503
    }
    if (["internal", "internal"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.INTERNAL_ERROR; // 500
    }
    if (["cancelled", "cancelled"].includes(lowerErrorCode)) {
      return ErrorStatusCodes.CLIENT_CLOSED_REQUEST || 499; // 499 (non-standard)
    }
    if (["alreadyexist", "already_exist"].includes(errorCode.toLowerCase())) {
      return ErrorStatusCodes.CONFLICT; // 409
    }
    if (["alreadyexist", "already_exist"].includes(errorCode.toLowerCase())) {
      return ErrorStatusCodes.CONFLICT; // 409
    }
    if (["deadline_exceeded", "deadlineexceeded"].includes(errorCode.toLowerCase())) {
      return ErrorStatusCodes.GATEWAY_TIMEOUT; // 504
    }
    if (errorCode.includes('UNIMPLEMENTED')) {
      return ErrorStatusCodes.NOT_IMPLEMENTED; // 501
    }
    if (errorCode.includes('OUT_OF_RANGE')) {
      return ErrorStatusCodes.BAD_REQUEST; // 400
    }
    if (errorCode.includes('ABORTED')) {
      return ErrorStatusCodes.CONFLICT; // 409
    }
    if (errorCode.includes('DATA_LOSS')) {
      return ErrorStatusCodes.INTERNAL_ERROR; // 500
    }
    return ErrorStatusCodes.BAD_REQUEST; // 400
  }

  public serializeErrors(): { message: string; field?: string }[] {
    return this.details.map(msg => ({
      message: msg.message,
      field: msg.field,
    }));
  }
}
