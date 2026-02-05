import { Metadata } from '@grpc/grpc-js';
import { context, propagation } from '@opentelemetry/api';
import { Request } from 'express';

export const attachMetadata = (req: Request): Metadata => {
  const metadata = new Metadata();

  if (req.headers.authorization) {
    metadata.set('authorization', req.headers.authorization);
  }

  if (req.headers['x-request-id']) {
    metadata.set('x-request-id', String(req.headers['x-request-id']));
  }

  if (req.headers['idempotency-key'] || req.headers['x-request-id']) {
    metadata.set(
      'idempotency-key',
      String(req.headers['idempotency-key'] || req.headers['x-request-id'])
    );
  }

  if (req.user) {
    metadata.set("x-user-id", req.user.userId)
    metadata.set('x-user', JSON.stringify(req.user));
  }

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
