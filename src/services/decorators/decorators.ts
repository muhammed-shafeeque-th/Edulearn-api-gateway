import { lazyMetrics, lazyTracer } from '@/shared/utils/lazy.services';
import { SpanStatusCode } from '@opentelemetry/api';

export function Trace(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const opName =
        operationName || `${target.constructor.name}.${propertyKey}`;

      return lazyTracer()?.startActiveSpan(opName, async span => {
        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error: any) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
          throw error;
        }
      });
    };

    return descriptor;
  };
}

export function MonitorGrpc(serviceName: string, method?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodName = method || propertyKey;

      const endTimer = lazyMetrics()?.measureGRPCRequestDuration(
        methodName,
        undefined,
        serviceName
      );

      try {
        const result = await originalMethod.apply(this, args);
        endTimer?.();
        return result;
      } catch (error: any) {
        lazyMetrics()?.incrementGrpcErrorCounter(
          methodName,
          serviceName,
          'unknown',
          error?.statusCode || 500
        );
        throw error;
      }
    };

    return descriptor;
  };
}
