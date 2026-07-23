import { TYPES } from '@/services/di';
import { container } from '@/services/di/di.config';
import {
  ILoggerService,
  IMetricService,
  ITraceService,
} from '@/services/observability/interfaces';
import { RedisService } from '@/services/redis';

let logger: ILoggerService;
let metrics: IMetricService;
let tracer: ITraceService;
let redis: RedisService;

// Lazy functions
export function lazyTracer() {
  return (tracer ??= container?.get<ITraceService>(TYPES.TraceService));
}
export function lazyLogger() {
  return (logger ??= container?.get<ILoggerService>(TYPES.LoggerService));
}

export function lazyMetrics() {
  return (metrics ??= container?.get<IMetricService>(TYPES.MetricService));
}
export function lazyCache() {
  return (redis ??= container?.get<RedisService>(TYPES.CacheService));
}
