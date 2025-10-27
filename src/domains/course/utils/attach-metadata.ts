import { Metadata } from '@grpc/grpc-js';
import { context, propagation } from '@opentelemetry/api';
import { Request } from 'express';

export const attachMetadata = (req: Request) => (): Metadata => {
  const metadata = new Metadata();

  // Copy over auth headers
  if (req.headers.authorization) {
    metadata.set('authorization', req.headers.authorization);
  }

  // Trace ID for observability (fallback to request id if available)
  if (req.headers['x-request-id']) {
    metadata.set('x-request-id', String(req.headers['x-request-id']));
  }

  if (req.headers['idempotency-key'] || req.headers['x-request-id']) {
    metadata.set(
      'idempotency-key',
      String(req.headers['idempotency-key'] || req.headers['x-request-id'])
    );
  }

  // User info (if your auth middleware attaches req.user)
  if (req.user) {
    metadata.set('x-user', JSON.stringify(req.user));
  }

  // Any custom headers you want to propagate
  if (req.headers['x-correlation-id']) {
    metadata.set('x-correlation-id', String(req.headers['x-correlation-id']));
  }

  // Inject OpenTelemetry context as HTTP headers into gRPC metadata.
  propagation.inject(context.active(), metadata, {
    set: (carrier, key, value) => {
      (carrier as Metadata).set(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    },
  });

  return metadata;
};
