import { BaseError } from './base-error';
import { ErrorCodes } from './codes/error-codes';
import { ErrorStatusCodes } from './codes/error-status-codes';

export class UserProhibitedError extends BaseError {
  errorCode: ErrorCodes.PERMISSION_DENIED = ErrorCodes.PERMISSION_DENIED;
  statusCode: ErrorStatusCodes.PERMISSION_DENIED =
    ErrorStatusCodes.PERMISSION_DENIED;

  public constructor(message?: string) {
    super(message || 'User has been prohibited to access the resource');
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message:
          'User has been prohibited to access the resources, please reach out to admin',
      },
    ];
  }
}
