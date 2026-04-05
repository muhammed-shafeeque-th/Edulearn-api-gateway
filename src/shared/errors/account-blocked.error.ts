import { BaseError } from "./base-error";
import { ErrorCodes } from "./codes/error-codes";
import { ErrorStatusCodes } from "./codes/error-status-codes";

export class AccountBlockedError extends BaseError {
  errorCode: ErrorCodes.ACCOUNT_BLOCKED = ErrorCodes.ACCOUNT_BLOCKED;
  statusCode: ErrorStatusCodes.ACCOUNT_BLOCKED =
    ErrorStatusCodes.ACCOUNT_BLOCKED;

  public constructor(message?: string) {
    super(message || "Your account has been blocked. Please contact support.");
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
