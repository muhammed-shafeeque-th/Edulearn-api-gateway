import { BaseError } from "./base-error";
import { ErrorCodes } from "./codes/error-codes";
import { ErrorStatusCodes } from "./codes/error-status-codes";

export class InstructorAccessDeniedError extends BaseError {
  errorCode: ErrorCodes.INSTRUCTOR_ACCESS_DENIED = ErrorCodes.INSTRUCTOR_ACCESS_DENIED;
  statusCode: ErrorStatusCodes.INSTRUCTOR_ACCESS_DENIED =
    ErrorStatusCodes.INSTRUCTOR_ACCESS_DENIED;

  public constructor(message?: string) {
    super(message || "Access denied: Your instructor privileges have been blocked.");
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
