import { BaseError } from "./base-error";
import { ErrorCodes } from "./codes/error-codes";
import { ErrorStatusCodes } from "./codes/error-status-codes";

export class AuthorizationError extends BaseError {
  errorCode: ErrorCodes.AUTHORIZATION_ERROR = ErrorCodes.AUTHORIZATION_ERROR;
  statusCode: ErrorStatusCodes.AUTHORIZATION_ERROR =
    ErrorStatusCodes.AUTHORIZATION_ERROR;

  public constructor(message?: string) {
    super(message || "Access denied");
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: "Required authorization. Please check your permissions and try again",
      },
    ];
  }
}
