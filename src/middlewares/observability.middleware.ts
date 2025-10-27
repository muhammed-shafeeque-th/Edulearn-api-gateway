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

// Set W3C Propagator globally only once at the start of app
const propagator: TextMapPropagator = new W3CTraceContextPropagator();
propagation.setGlobalPropagator(propagator);

// Tracer instance (singleton recommended)
const logger = LoggingService.getInstance();
const tracer = TracingService.getInstance();
const monitoring = MetricsService.getInstance();

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
        'http.request.id': req.headers['x-request-id'] as string,
        // User specific attributes
        'endUser.id': req.user?.userId as string,
        'endUser.role': req.user?.role as string,
      },
    },
    incomingContext === ROOT_CONTEXT ? undefined : incomingContext
  );

  // Activate context for the current span
  context.with(trace.setSpan(incomingContext, span), () => {
    logger.info(`Incoming HTTP request: ${req.method} ${req.path}`, {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId ?? '',
      traceId: span.spanContext().traceId,
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

      // Update metrics to measure request duration and request counter
      end(res.statusCode);
      monitoring.incrementHttpRequestCounter(
        req.method,
        req.route?.path || req.path,
        res.statusCode
      );

      // Update status if response indicates error
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

      // Log response info
      logger.info(
        `Outgoing HTTP response: ${req.method} ${req.path} - ${res.statusCode}`,
        {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: duration,
          traceId: span.spanContext().traceId,
        }
      );
    });

    next();
  });
}
