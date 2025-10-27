import { status as GrpcStatus, ServiceError } from '@grpc/grpc-js';
import { BaseError } from './base-error';

/**
 * Maps gRPC error codes to HTTP status codes.
 * @param grpcCode - The gRPC status code
 * @returns The corresponding HTTP status code
 */
export function mapErrorToHttpStatus(grpcCode: number): number {
  switch (grpcCode) {
    case GrpcStatus.OK:
      return 200;
    case GrpcStatus.CANCELLED:
      return 499; // Client Closed Request (non-standard)
    case GrpcStatus.UNKNOWN:
      return 500;
    case GrpcStatus.INVALID_ARGUMENT:
      return 400;
    case GrpcStatus.DEADLINE_EXCEEDED:
      return 504;
    case GrpcStatus.NOT_FOUND:
      return 404;
    case GrpcStatus.ALREADY_EXISTS:
      return 409;
    case GrpcStatus.PERMISSION_DENIED:
      return 403;
    case GrpcStatus.UNAUTHENTICATED:
      return 401;
    case GrpcStatus.RESOURCE_EXHAUSTED:
      return 429;
    case GrpcStatus.FAILED_PRECONDITION:
      return 400;
    case GrpcStatus.ABORTED:
      return 409;
    case GrpcStatus.OUT_OF_RANGE:
      return 400;
    case GrpcStatus.UNIMPLEMENTED:
      return 501;
    case GrpcStatus.INTERNAL:
      return 500;
    case GrpcStatus.UNAVAILABLE:
      return 503;
    case GrpcStatus.DATA_LOSS:
      return 500;
    default:
      return 500;
  }
}

const mapErrorMessages: Record<number, string> = {
  [GrpcStatus.UNAVAILABLE]: 'Service is currently unavailable.',
  [GrpcStatus.NOT_FOUND]: 'Resource not found.',
  [GrpcStatus.INVALID_ARGUMENT]: 'Invalid argument provided.',
  [GrpcStatus.PERMISSION_DENIED]: 'Permission denied.',
  [GrpcStatus.UNAUTHENTICATED]: 'Authentication required.',
  [GrpcStatus.ALREADY_EXISTS]: 'Resource already exists.',
  [GrpcStatus.DEADLINE_EXCEEDED]: 'Request deadline exceeded.',
  [GrpcStatus.INTERNAL]: 'Internal server error.',
  [GrpcStatus.CANCELLED]: 'Request was cancelled.',
  [GrpcStatus.UNIMPLEMENTED]: 'The server does not implement the method',
};
const mapGrpcErrorCode: Record<number, string> = {
  [GrpcStatus.UNAVAILABLE]: 'UNAVAILABLE_ERROR',
  [GrpcStatus.NOT_FOUND]: 'NOT_FOUND_ERROR',
  [GrpcStatus.INVALID_ARGUMENT]: 'INVALID_ARGUMENT_ERROR',
  [GrpcStatus.PERMISSION_DENIED]: 'PERMISSION_DENIED_ERROR',
  [GrpcStatus.UNAUTHENTICATED]: 'UNAUTHENTICATED_ERROR',
  [GrpcStatus.ALREADY_EXISTS]: 'ALREADY_EXISTS_ERROR',
  [GrpcStatus.DEADLINE_EXCEEDED]: 'DEADLINE_EXCEEDED_ERROR',
  [GrpcStatus.INTERNAL]: 'INTERNAL_ERROR',
  [GrpcStatus.CANCELLED]: 'CANCELLED_ERROR',
  [GrpcStatus.RESOURCE_EXHAUSTED]: 'RESOURCE_EXHAUSTED_ERROR',
  [GrpcStatus.FAILED_PRECONDITION]: 'FAILED_PRECONDITION_ERROR',
  [GrpcStatus.ABORTED]: 'ABORTED_ERROR',
  [GrpcStatus.DATA_LOSS]: 'DATA_LOSS_ERROR',
  [GrpcStatus.UNKNOWN]: 'UNKNOWN_ERROR',
  [GrpcStatus.UNIMPLEMENTED]: 'UNIMPLEMENTED_ERROR',
};


export class GrpcServiceError extends BaseError {
  statusCode: number;
  errorCode: string;
  details: string[];

  constructor(serviceError: ServiceError) {
    const message =
      mapErrorMessages[serviceError.code] || serviceError.message || 'Unknown gRPC error';
    super(message);

    this.statusCode = mapErrorToHttpStatus(serviceError.code); // Bad Gateway for upstream errors
    this.errorCode = mapGrpcErrorCode[serviceError.code] || 'UNKNOWN_ERROR';
    this.details = [serviceError.details || message];
  }

  serializeErrors() {
    return this.details.map((msg) => ({ message: msg }));
  }
}
