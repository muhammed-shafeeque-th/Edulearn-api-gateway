import {
  lazyLogger,
  lazyMetrics,
  lazyTracer,
} from '@/shared/utils/lazy.services';
import { SpanStatusCode } from '@opentelemetry/api';

export interface TraceOptions {
  name?: string;
  attributes?: Record<string, any>;
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
      const spanName = options.name || propertyKey.toString();
      const attributes = {
        ...options.attributes,
        class: target.constructor.name,
        method: propertyKey.toString(),
      };

      return lazyTracer()?.startActiveSpan(
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
          } 
        },
        attributes
      );
    };

    return descriptor;
  };
}

export interface TraceOptions {
  name?: string;
  attributes?: Record<string, any>;
}

export function traceSpan(options: TraceOptions = {}): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const spanName = options.name || propertyKey.toString();
      const attributes = {
        ...options.attributes,
        class: target.constructor.name,
        method: propertyKey.toString(),
      };

      return lazyTracer()?.startActiveSpan(
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

export function observe(options: ObservabilityOptions = {}): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const spanName =
        options.spanName || `${target.constructor.name}.${String(propertyKey)}`;
      const attributes = {
        ...options.attributes,
        class: target.constructor.name,
        method: propertyKey.toString(),
      };

      const metricName = options.metricName || 'http_request_duration_seconds';
      const startTime = process.hrtime();

      return lazyTracer()?.startActiveSpan(
        spanName,
        async span => {
          try {
            lazyLogger()?.debug(`Executing ${spanName}`, {
              ctx: `${target.constructor.name}.${String(propertyKey)}`,
            });

            const result = await originalMethod.apply(this, args);

            const diff = process.hrtime(startTime);
            const durationSeconds = diff[0] + diff[1] / 1e9;

            // lazyMetrics()?.recordHistogram(metricName, durationSeconds, {
            //   method: propertyKey.toString(),
            //   route: target.constructor.name,
            // });

            span.setStatus({
              code: SpanStatusCode.OK,
              message: 'Success',
            });

            if (options.logLevel === 'debug' || options.logLevel === 'info') {
              lazyLogger()?.debug(`Execution completed for  ${spanName}`, {
                ctx: `${target.constructor.name}.${String(propertyKey)}`,
                duration: durationSeconds,
              });
            }

            return result;
          } catch (error: any) {
            span.recordException(error);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });

            lazyMetrics()?.incrementHttpErrorCounter(
              'unknown',
              target.constructor.name,
              500
            );

            lazyLogger()?.error(`Error in ${spanName}`, {
              ctx: `${target.constructor.name}.${String(propertyKey)}`,
              error: error.message,
            });

            throw error;
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
