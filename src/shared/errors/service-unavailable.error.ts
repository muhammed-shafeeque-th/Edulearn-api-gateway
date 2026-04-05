import { BaseError } from "./base-error";
import { ErrorStatusCodes } from "./codes/error-status-codes";

export class ServiceNotAvailableError extends BaseError {
  statusCode = ErrorStatusCodes.UNAVAILABLE;
  errorCode = "SERVICE_NOT_AVAILABLE";

  constructor(public message: string = "Service is currently unavailable", reason?: string ) {
	super(message);
  }

  serializeErrors() {
	return [{ message: this.message }];
  }
}