import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '@/services/observability/logging/logging.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const logger = LoggingService.getInstance();
const monitoring = MetricsService.getInstance();

/**
 * Generic async handler for Express route handlers.
 * Catches and propagates errors, logs details, and records metrics.
 */
export const asyncHandler = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';

    try {
      logger.debug(`Request started: ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        path: req.originalUrl,
        userId: req.user?.userId,
        ip: req.ip,
      });

      const result = await handler(req, res, next);

      const duration = Date.now() - startTime;

      logger.debug(`Request completed: ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        path: req.originalUrl,
        duration,
        statusCode: res.statusCode,
      });

      monitoring.measureHttpRequestDuration(
        req.method,
        req.originalUrl,
        duration
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`Request failed: ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        path: req.originalUrl,
        duration: `${duration}ms`,
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
              }
            : error,
        userId: req.user?.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Record error metrics
      monitoring.incrementHttpErrorCounter(
        req.method,
        req.originalUrl,
        error instanceof Error ? error.name : 'UnknownError'
      );

      next(error);
    }
  };
};

/**
 * Specialized async handler for external API calls.
 * Logs request/response, propagates errors, and records metrics.
 */
export const apiAsyncHandler = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';

    try {
      logger.debug(
        `External API call started: ${req.method} ${req.originalUrl}`,
        {
          requestId,
          method: req.method,
          path: req.originalUrl,
        }
      );

      const result = await handler(req, res, next);

      const duration = Date.now() - startTime;

      logger.debug(
        `External API call completed: ${req.method} ${req.originalUrl}`,
        {
          requestId,
          method: req.method,
          path: req.originalUrl,
          duration,
        }
      );

      // Record external API metrics, fallback to http metric if unavailable
      if (typeof monitoring.measureHttpRequestDuration === 'function') {
        monitoring.measureHttpRequestDuration(
          req.method,
          req.originalUrl,
          duration
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        `External API call failed: ${req.method} ${req.originalUrl}`,
        {
          requestId,
          method: req.method,
          path: req.originalUrl,
          duration,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : error,
        }
      );

      // Use generic error metric fallback
      if (typeof monitoring.incrementHttpErrorCounter === 'function') {
        monitoring.incrementHttpErrorCounter(
          req.method,
          req.originalUrl,
          error instanceof Error ? error.name : 'UnknownError'
        );
      }

      next(error);
    }
  };
};

/**
 * Generic async handler for handling gRPC calls with best practices.
 *
 * - Logs the start, completion, and failure of gRPC requests.
 * - Records duration and error metrics.
 *
 * @param handler     - Async function for gRPC logic: (...args) => Promise<any>
 * @param options     - Optional object, may include a custom methodName or context extractor function.
 * @returns           - A wrapped function that handles error propagation and observability.
 */
export function asyncGrpcCall<TArgs extends any[], TResult>(
  handler: (...args: TArgs) => Promise<TResult>,
  options?: {
    methodName?: string;
    extractMeta?: (...args: TArgs) => Record<string, any>;
  }
): (...args: TArgs) => Promise<TResult> {
  // Method name extraction: prefer explicit, fallback to handler.name, or use <anonymous>
  const methodName =
    options?.methodName ||
    handler.name ||
    '<anonymous gRPC method>';

  return async (...args: TArgs): Promise<TResult> => {
    const startTime = Date.now();

    // Flexible metadata extraction
    let meta: Record<string, any> = {};
    if (typeof options?.extractMeta === 'function') {
      try {
        meta = options.extractMeta(...args) || {};
      } catch (e) {
        logger.warn(`[gRPC] Metadata extraction failed: ${methodName}`, { error: e });
        meta = {};
      }
    }

    try {
      logger.debug(`[gRPC] Call started: ${methodName}`, meta);

      const result = await handler(...args);

      const duration = Date.now() - startTime;

      logger.debug(`[gRPC] Call completed: ${methodName}`, {
        ...meta,
        duration,
      });

      if (typeof monitoring?.measureGRPCRequestDuration === 'function') {
        monitoring.measureGRPCRequestDuration(methodName, duration);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`[gRPC] Call failed: ${methodName}`, {
        ...meta,
        duration,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      });

      if (typeof monitoring?.incrementGrpcErrorCounter === 'function') {
        monitoring.incrementGrpcErrorCounter(
          methodName,
          error instanceof Error ? error.name : 'UnknownError'
        );
      }

      throw error;
    }
  };
}
