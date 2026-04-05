import { BaseError } from "./base-error";
import { ErrorCodes } from "./codes/error-codes";
import { ErrorStatusCodes } from "./codes/error-status-codes";

export class AuthenticationError extends BaseError {
  errorCode: ErrorCodes.AUTHENTICATION_ERROR = ErrorCodes.AUTHENTICATION_ERROR;
  statusCode: ErrorStatusCodes.AUTHENTICATION_ERROR =
    ErrorStatusCodes.AUTHENTICATION_ERROR;

  public constructor(message?: string) {
    super(message || "Authentication failed");
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: "Please check your credentials and try again",
      },
    ];
  }
}
