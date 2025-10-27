import { SpanStatusCode } from "@opentelemetry/api";
import { TracingService } from "../tracing/trace.service";
import { MetricsService } from "../metrics/metrics.service";
import { LoggingService } from "../logging/logging.service";

export interface TraceOptions {
  name?: string; // custom span name
  attributes?: Record<string, any>; // attributes to attach
}

/**
 * Method decorator to trace execution
 */
export function TraceSpan(options: TraceOptions = {}): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracer = TracingService .getInstance();
      const spanName = options.name || propertyKey.toString();
      const attributes = {
        ...options.attributes,
        class: target.constructor.name,
        method: propertyKey.toString(),
      };

      return tracer.startActiveSpan(
        spanName,
        async span => {
          try {
            const result = await originalMethod.apply(this, args);

            span.setStatus({ code: SpanStatusCode.OK, message: 'Success' });
            return result;
          } catch (error: any) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            throw error;
          } finally {
            span.end();
          }
        },
        attributes
      );
    };

    return descriptor;
  };
}


export interface TraceOptions {
  name?: string; // custom span name
  attributes?: Record<string, any>; // attributes to attach
}

/**
 * Method decorator to trace execution
 */
export function traceSpan(options: TraceOptions = {}): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracer = TracingService.getInstance();
      const spanName = options.name || propertyKey.toString();
      const attributes = {
        ...options.attributes,
        class: target.constructor.name,
        method: propertyKey.toString(),
      };

      return tracer.startActiveSpan(
        spanName,
        async span => {
          try {
            const result = await originalMethod.apply(this, args);

            span.setStatus({ code: SpanStatusCode.OK, message: 'Success' });
            return result;
          } catch (error: any) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            throw error;
          } finally {
            span.end();
          }
        },
        attributes
      );
    };

    return descriptor;
  };
}


interface ObservabilityOptions {
  spanName?: string;
  metricName?: string;
  logLevel?: 'info' | 'debug' | 'warn' | 'error';
  attributes?: Record<string, any>;
}

/**
 * Method decorator for unified Observability (Tracing + Metrics + Logging)
 */
export function observe(options: ObservabilityOptions = {}): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const tracing = TracingService.getInstance();
      const metrics = MetricsService.getInstance();
      const logger = LoggingService.getInstance();

      const spanName =
        options.spanName || `${target.constructor.name}.${String(propertyKey)}`;
      const attributes = {
        ...options.attributes,
        class: target.constructor.name,
        method: propertyKey.toString(),
      };

      const metricName = options.metricName || 'http_request_duration_seconds';
      const startTime = process.hrtime(); // for latency measurement

      return tracing.startActiveSpan(
        spanName,
        async span => {
          try {
             logger.info(`Executing ${spanName}`, {
                ctx: `${target.constructor.name}.${String(propertyKey)}`,
                // args,
              });
            // Run original method
            const result = await originalMethod.apply(this, args);

            // Measure duration (ms)
            const diff = process.hrtime(startTime);
            const durationSeconds = diff[0] + diff[1] / 1e9;

            metrics.recordHistogram(metricName, durationSeconds, {
              method: propertyKey.toString(),
              route: target.constructor.name,
            });

            span.setStatus({
              code: SpanStatusCode.OK,
              message: 'Success',
            });

            if (options.logLevel === 'debug' || options.logLevel === 'info') {
              logger.info(`Execution completed for  ${spanName}`, {
                ctx: `${target.constructor.name}.${String(propertyKey)}`,
                duration: durationSeconds,
                // args,
              });
            }

            return result;
          } catch (error: any) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });

            // Increment error metrics
            metrics.incrementHttpErrorCounter(
              'unknown',
              target.constructor.name,
              500
            );

            // Log error
            logger.error(`Error in ${spanName}`, {
              ctx: `${target.constructor.name}.${String(propertyKey)}`,
              error: error.message,
            //   stack: error.stack,
            //   args,
            });

            throw error;
          } finally {
            span.end();
          }
        },
        attributes
      );
    };

    return descriptor;
  };
}

export function Observe(options?: ObservabilityOptions): ClassDecorator {
  return function (target: Function) {
    const propertyNames = Object.getOwnPropertyNames(target.prototype);

    for (const propertyName of propertyNames) {
      if (propertyName === 'constructor') continue;

      const descriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        propertyName
      );
      if (!descriptor || typeof descriptor.value !== 'function') continue;

      Object.defineProperty(
        target.prototype,
        propertyName,
        observe({
          ...options,
          spanName: `${target.name}.${propertyName}`,
        })(target.prototype, propertyName, descriptor)!
      );
    }
  };
}
