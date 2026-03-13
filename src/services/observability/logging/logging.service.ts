import { config } from '@/config';
import { logger, shutdownLogger } from './setup';
import { context, trace } from '@opentelemetry/api';
import { injectable } from 'inversify';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  userId?: string;
  correlationId?: string;
  service?: string;
  environment?: string;
  ctx?: string; // e.g., method or component
  [key: string]: unknown;
}


@injectable()
export class LoggingService {
  private readonly serviceName: string;
  private readonly boundContext: LogContext;

  private constructor(defaultContext: LogContext = {}) {
    this.serviceName = config.serviceName;
    this.boundContext = { ...defaultContext };
  }

  public static getLogger(context: LogContext = {}): LoggingService {
    return new LoggingService(context);
  }

 
  public static getInstance(context: LogContext = {}): LoggingService {
    if (!LoggingService.singleton) {
      LoggingService.singleton = new LoggingService(context);
    }
    return LoggingService.singleton;
  }
  private static singleton: LoggingService;

  private composeLog(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    ctx: LogContext = {}
  ) {
    const merged: LogContext = { ...this.boundContext, ...ctx };
    const span = trace.getSpan(context.active());
    const spanCtx = span?.spanContext();

    return {
      level,
      message,
      traceId: spanCtx?.traceId ?? merged.traceId,
      spanId: spanCtx?.spanId ?? merged.spanId,
      userId: merged.userId,
      correlationId: merged.correlationId,
      service: merged.service || this.serviceName,
      environment: config.nodeEnv || 'development',
      caller: config.nodeEnv !== 'production' ? this.getCaller() : undefined,
      ...merged,
    };
  }

  info(message: string, context?: LogContext): void {
    logger.info(message, this.composeLog('info', message, context));
  }

  error(message: string, context?: LogContext): void {
    logger.error(message, this.composeLog('error', message, context));
  }

  warn(message: string, context?: LogContext): void {
    logger.warn(message, this.composeLog('warn', message, context));
  }

  debug(message: string, context?: LogContext): void {
    logger.debug(message, this.composeLog('debug', message, context));
  }

  async shutdown(): Promise<void> {
    await shutdownLogger();
  }

  /**
   * Returns stack caller for debugging (not included in prod).
   * @private
   */
  private getCaller(): string | undefined {
    const stack = new Error().stack;
    if (!stack) return undefined;
    const stackLines = stack.split('\n').map(line => line.trim());

    // Find the first stack line that is NOT from logging.service.ts
    for (const line of stackLines) {
      if (
        line &&
        !line.includes('logging.service') &&
        (line.startsWith('at ') || line.match(/\(([^)]+)\)/))
      ) {
        // Extract file path and line number
        const match = line.match(/\(([^)]+)\)/) || line.match(/at (.+)/);
        return match ? match[1] + ' ' : undefined;
      }
    }
    return undefined;
  }
}
