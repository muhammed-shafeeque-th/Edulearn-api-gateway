import {
  context,
  propagation,
  ROOT_CONTEXT,
  TextMapPropagator,
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { NextFunction, Request, Response } from 'express';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { LoggingService } from 'services/observability/logging/logging.service';
import { TracingService } from 'services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';
import { container, TYPES } from '@/services/di';

const propagator: TextMapPropagator = new W3CTraceContextPropagator();
propagation.setGlobalPropagator(propagator);

const logger = container.get<LoggingService>(TYPES.LoggingService);
const tracer = container.get<TracingService>(TYPES.TracingService);
const monitoring = container.get<MetricsService>(TYPES.MetricsService);

export function observabilityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const end = monitoring.measureHttpRequestDuration(
    req.method,
    req.route?.path || req.path
  );
  const requestId =
    (req.headers['x-request-id'] as string) ||
    req.headers['X-Request-Id'] ||
    'unknown';

  const incomingContext = propagation.extract(context.active(), req.headers);
  const span = tracer.startSpan(
    `HTTP ${req.method} ${req.path}`,
    {
      attributes: {
        [SemanticAttributes.HTTP_METHOD]: req.method,
        [SemanticAttributes.HTTP_URL]: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        [SemanticAttributes.HTTP_USER_AGENT]:
          req.get('user-agent') || 'unknown',
        [SemanticAttributes.HTTP_TARGET]: req.originalUrl,
        [SemanticAttributes.HTTP_HOST]: req.get('host') || 'unknown',
        [SemanticAttributes.NET_PEER_IP]: req.ip,
        'http.request.id': requestId,
        // User specific attributes
        'endUser.id': req.user?.userId as string,
        'endUser.role': req.user?.roles as string[],
      },
    },
    incomingContext === ROOT_CONTEXT ? undefined : incomingContext
  );

  // Activate context for the current span
  context.with(trace.setSpan(incomingContext, span), () => {
    logger.debug(`Incoming HTTP request: ${req.method} ${req.path}`, {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId ?? '',
      traceId: span.spanContext().traceId,
      requestId,
      path: req.originalUrl,
      ip: req.ip,
    });
    // Inject span context into headers for downstream propagation
    propagation.inject(context.active(), req.headers, {
      set(carrier, key, value) {
        req.headers[key] = value;
      },
    });

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, res.statusCode);
      span.setAttribute('http.response.duration_ms', duration);
      tracer.endSpan(span);

      end?.(res.statusCode);
      monitoring.incrementHttpRequestCounter(
        req.method,
        req.route?.path || req.path,
        res.statusCode
      );

      if (res.statusCode >= 400) {
        monitoring.incrementHttpErrorCounter(
          req.method,
          req.route?.path || req.path,
          res.statusCode
        );
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP error ${res.statusCode}`,
        });
      }

      logger.debug(
        `Outgoing HTTP response: ${req.method} ${req.path} - ${res.statusCode}`,
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: duration,
          traceId: span.spanContext().traceId,
          'endUser.id': req.user?.userId as string,
          'endUser.role': req.user?.roles as string[],
        }
      );
    });

    next();
  });
}
