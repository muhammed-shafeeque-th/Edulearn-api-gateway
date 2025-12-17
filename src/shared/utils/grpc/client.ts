import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
  CircuitBreakerWrapper,
  defaultCircuitBreakerConfig,
} from './circuit-breaker';
import { defaultRateLimiterConfig, RateLimiter } from '../rate-limiter';
import { GrpcClientConfig, GrpcClientOptions } from './types';
import { GrpcClientPool } from './_libs/client-pool';
// import { defaultRetryConfig, withRetry } from "../retry";
import { StorageMemory } from '@/shared/constants/storage';
import { GrpcServiceError } from '../errors/grpc-service.error';
import { GrpcResponseError } from '../errors/grpc-response.error';
import { type Error as ErrorResponse } from '@/domains/service-clients/user/proto/generated/user/common';
import { config as appConfig, config } from '@/config';

type ProtoObject =
  | grpc.GrpcObject
  | grpc.ServiceClientConstructor
  | grpc.ProtobufTypeDefinition
  | undefined;

export class GrpcClient<T extends grpc.Client> {
  private readonly client: T;
  // private readonly clientPool?: GrpcClientPool<Record<string, Function>>;
  private readonly circuitBreaker: CircuitBreakerWrapper;
  private readonly rateLimiter: RateLimiter;
  private readonly config: Required<GrpcClientConfig>;
  private metadata: grpc.Metadata;

  constructor(config: GrpcClientConfig) {
    this.config = {
      credentials: grpc.credentials.createInsecure(),
      deadlineMs: 10000,
      keepAliveTimeoutMs: 20000,
      maxMessageSize: StorageMemory.MB * 10,
      loaderOptions: config.loaderOptions ?? {},
      channelOptions: config.channelOptions ?? {},
      // retryConfig: defaultRetryConfig,
      circuitBreakerConfig: defaultCircuitBreakerConfig,
      rateLimiterConfig: defaultRateLimiterConfig,
      ...config,
    };

    // Optional: enable pooled client with load balancing via env flag
    // if (appConfig.grpc.usePool === 'true') {
    //   this.clientPool = new GrpcClientPool<Record<string, Function>>({
    //     protoPath: this.config.protoPath,
    //     packageName: this.config.packageName,
    //     serviceName: this.config.serviceName,
    //     host: this.config.host,
    //     port: this.config.port,
    //     // defaults inside the pool will fill the rest
    //   });
    // }

    this.metadata = new grpc.Metadata();
    const proto = this.loadProto();
    this.client = this.initializeClient(proto);
    this.circuitBreaker = new CircuitBreakerWrapper(
      this.makeUnaryCall.bind(this),
      this.config.circuitBreakerConfig
    );
    this.rateLimiter = new RateLimiter(this.config.rateLimiterConfig);
  }

  private loadProto() {
    const packageDefinition = protoLoader.loadSync(this.config.protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      ...this.config.loaderOptions,
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    return protoDescriptor[this.config.packageName];
  }

  private initializeClient(proto: ProtoObject): T {
    const protoObj = proto as grpc.GrpcObject;
    const serviceConstructor = protoObj[
      this.config.serviceName
    ] as grpc.ServiceClientConstructor;

    if (!serviceConstructor || typeof serviceConstructor !== 'function') {
      throw new Error(
        `Service "${this.config.serviceName}" not found in loaded proto package "${this.config.packageName}".`
      );
    }
    // );
    this.initializeMetadata();
    // return new ClientConstructor(
    return new serviceConstructor(
      `${this.config.host}:${this.config.port}`,
      this.config.credentials,
      {
        'grpc.default_compression_algorithm': grpc.compressionAlgorithms.gzip,
        'grpc.max_reconnect_backoff_ms': 5000,
        'grpc.service_config': JSON.stringify({
          loadBalancingConfig: [{ round_robin: {} }],
          methodConfig: [
            {
              name: [{ service: this.config.serviceName }],
              retryPolicy: {
                maxAttempts: 3,
                initialBackoff: '0.5s',
                maxBackoff: '5s',
                backoffMultiplier: 2,
                retryableStatusCodes: [
                  grpc.status.DEADLINE_EXCEEDED,
                  grpc.status.RESOURCE_EXHAUSTED,
                  grpc.status.ABORTED,
                  grpc.status.CANCELLED,
                  grpc.status.INTERNAL,
                ],
              },
            },
          ],
        }),
        'grpc.keepalive_timeout_ms': this.config.keepAliveTimeoutMs,
        'grpc.max_receive_message_length': this.config.maxMessageSize,
        'grpc.max_send_message_length': this.config.maxMessageSize,
        'grpc.keepalive_time_ms': 120000, // Send keep-alive pings every 2 minutes
        'grpc.http2.max_pings_without_data': 0, // Allow unlimited pings without data,
        ...this.config.channelOptions,
      }
    ) as unknown as T;
  }

  getClient(): T {
    return this.client;
  }

  private initializeMetadata() {
    this.metadata.set('x-service-version', config.serviceVersion || '1.0.1');
    this.metadata.set('x-client-id', config.serviceClientId || '123');
  }

  async unaryCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): Promise<P> {
    let metadata =
      options.metadata || options.attachMetadata?.() || this.metadata;

    if (metadata) {
      Object.entries(this.metadata.getMap()).forEach(([key, value]) => {
        metadata.set(key, value as string);
      });
    }

    // console.log(JSON.stringify({ metadata }, null, 2));

    // if (this.clientPool) {
    //   return this.clientPool.unaryCall<R, P>(
    //     method as unknown as keyof Record<string, Function>,
    //     request,
    //     { ...options, metadata }
    //   );
    // }
    const key = `${String(method)}:${JSON.stringify(request)}`;
    await this.rateLimiter.consume(key);
    return this.circuitBreaker.execute(method, request, metadata);
  }

  async *streamCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): AsyncIterableIterator<P> {
    // if (this.clientPool) {
    //   // Delegate to pool's stream call
    //   const stream = this.clientPool.streamCall<R, P>(
    //     method as unknown as keyof Record<string, Function>,
    //     request,
    //     options
    //   );
    //   for await (const chunk of stream) {
    //     yield chunk;
    //   }
    //   return;
    // }
    let metadata =
      options.metadata || (options.attachMetadata && options.attachMetadata());

    if (metadata) {
      metadata?.getMap &&
        Object.entries(metadata.getMap()).forEach(([key, value]) => {
          this.metadata.set(key, value as string);
        });
    }

    const key = `${String(method)}:${JSON.stringify(request)}`;
    await this.rateLimiter.consume(key);

    const deadline = new Date(Date.now() + this.config.deadlineMs);

    const clientMethod = this.client[method];
    if (typeof clientMethod !== 'function') {
      throw new Error(
        `Method ${String(method)} is not defined on the gRPC client.`
      );
    }
    const stream = clientMethod.call(this.client, request, metadata, {
      deadline,
    });

    for await (const response of stream) {
      yield response;
    }
  }

  private async makeUnaryCall<R, P>(
    method: keyof T,
    request: R,
    metadata: grpc.Metadata = this.metadata
  ) {
    const deadline = new Date(Date.now() + this.config.deadlineMs);
    return new Promise((resolve, reject) => {
      const clientMethod = this.client[method];
      if (typeof clientMethod !== 'function') {
        throw new Error(
          `Method ${String(method)} is not defined on the gRPC client.`
        );
      }
      clientMethod.call(
        this.client,
        request,
        metadata,
        { deadline },
        (
          error: grpc.ServiceError | null,
          response: { error?: ErrorResponse; success: P }
        ) => {
          const requestId =
            metadata.get('request_id')?.[0]?.toString() || 'unknown';
          // if (error) reject(new GrpcTransformedError(error, requestId));
          if (error) reject(new GrpcServiceError(error));
          if (response?.error) {
            return reject(new GrpcResponseError(response?.error));
          }
          resolve(response);
        }
      );
    });
  }

  private isRetryable(error: grpc.ServiceError): boolean {
    const retryableStatusCodes = new Set([
      grpc.status.DEADLINE_EXCEEDED,
      grpc.status.UNAVAILABLE,
      grpc.status.RESOURCE_EXHAUSTED,
      grpc.status.ABORTED,
      grpc.status.CANCELLED,
      grpc.status.INTERNAL,
      grpc.status.ALREADY_EXISTS,
    ]);

    return retryableStatusCodes.has(error.code);
  }

  close() {
    try {
      void this.client.close();
      // if (this.clientPool) {
      //   void this.clientPool.shutdown();
      // }
    } finally {
      this.client.close();
      this.circuitBreaker.shutdown();
    }
  }
}
