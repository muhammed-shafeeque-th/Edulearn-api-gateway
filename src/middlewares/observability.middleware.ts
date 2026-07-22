import { trace, SpanStatusCode, context } from '@opentelemetry/api';
import { NextFunction, Request, Response } from 'express';

import { TYPES } from '@/services/di';

import { ILoggerService } from '@/services/observability/interfaces/logger.service';
import { IMetricService } from '@/services/observability/interfaces/metric.interface';
import { container } from '@/services/di/di.config';

const logger = container.get<ILoggerService>(TYPES.LoggerService);
const metrics = container.get<IMetricService>(TYPES.MetricService);

export function observabilityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const route = req.route?.path ?? req.path;

  const stopTimer = metrics.measureHttpRequestDuration(req.method, route);

  const start = process.hrtime.bigint();

  logger.debug('Incoming HTTP request', {
    method: req.method,
    route,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.userId,
  });

  res.once('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    stopTimer?.(res.statusCode);

    metrics.incrementHttpRequestCounter(req.method, route, res.statusCode);

    if (res.statusCode >= 400) {
      metrics.incrementHttpErrorCounter(req.method, route, res.statusCode);

      const span = trace.getSpan(context.active());

      span?.setStatus({
        code: SpanStatusCode.ERROR,

        message: `${res.statusCode}`,
      });
    }

    logger.debug('Outgoing HTTP response', {
      method: req.method,

      route,

      statusCode: res.statusCode,

      durationMs,
    });
  });

  next();
}
