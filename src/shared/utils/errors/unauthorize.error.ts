import { BaseError } from "./base-error";
import { ErrorCodes } from "./error-codes";
import { ErrorStatusCodes } from "./error-status-codes";

export class AuthorizationError extends BaseError {
  errorCode: ErrorCodes.AUTHORIZATION_ERROR = ErrorCodes.AUTHORIZATION_ERROR;
  statusCode: ErrorStatusCodes.AUTHORIZATION_ERROR =
    ErrorStatusCodes.AUTHORIZATION_ERROR;

  public constructor(message?: string) {
    super(message || "Access denied");

    Object.setPrototypeOf(this, this.constructor.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: "Required authorization. Please check your permissions and try again",
      },
    ];
  }
}
