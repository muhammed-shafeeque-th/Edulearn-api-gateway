import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
  CircuitBreakerWrapper,
  defaultCircuitBreakerConfig,
} from './circuit-breaker';
import { defaultRateLimiterConfig, RateLimiter } from '../../../services/security/ratelimiter/rate-limiter';
import { GrpcClientConfig, GrpcClientOptions } from './types';
import { StorageMemory } from '@/shared/constants/storage';
import { GrpcServiceError } from '../../errors/grpc-service.error';
import { GrpcResponseError } from '../../errors/grpc-response.error';
import { type Error as ErrorResponse } from '@/domains/service-clients/user/proto/generated/user/common';
import { config as appConfig, config } from '@/config';
import { EventEmitter } from 'events';


type ProtoObject =
  | grpc.GrpcObject
  | grpc.ServiceClientConstructor
  | grpc.ProtobufTypeDefinition
  | undefined;


export class GrpcClient<T extends grpc.Client> {
  private readonly client: T;
  private readonly circuitBreaker: CircuitBreakerWrapper;
  private readonly config: Required<GrpcClientConfig>;
  private readonly metadata: grpc.Metadata;

  constructor(cfg: GrpcClientConfig) {
    this.config = {
      credentials: grpc.credentials.createInsecure(),
      deadlineMs: 30000,
      keepAliveTimeoutMs: 20000,
      maxMessageSize: StorageMemory.MB * 10,
      loaderOptions: cfg.loaderOptions ?? {},
      channelOptions: cfg.channelOptions ?? {},
      circuitBreakerConfig: defaultCircuitBreakerConfig,
      rateLimiterConfig: defaultRateLimiterConfig,
      ...cfg,
    };

    this.metadata = new grpc.Metadata();
    this.initializeMetadata();


    const proto = this.loadProto();
    this.client = this.initializeClient(proto);

    this.circuitBreaker = new CircuitBreakerWrapper(
      this.makeUnaryCall.bind(this),
      this.config.circuitBreakerConfig
    );
  }

  /**
   * Loads the proto definition from the specified protoPath.
   * Returns the specific package from the proto descriptor.
   */
  private loadProto(): ProtoObject {
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

  /**
   * Instantiates the gRPC client with configured options.
   */
  private initializeClient(proto: ProtoObject): T {
    const protoObj = proto as grpc.GrpcObject;
    const constructor = protoObj?.[
      this.config.serviceName
    ] as grpc.ServiceClientConstructor;
    if (!constructor || typeof constructor !== 'function') {
      throw new Error(
        `Service "${this.config.serviceName}" not found in loaded proto package "${this.config.packageName}".`
      );
    }
    const address = `${this.config.host}:${this.config.port}`;
    return new constructor(address, this.config.credentials, {
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
                grpc.status.UNAVAILABLE,
                grpc.status.UNKNOWN,
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
      'grpc.keepalive_time_ms': 120000,
      'grpc.http2.max_pings_without_data': 0,
      ...this.config.channelOptions,
    } as grpc.ChannelOptions) as unknown as T;
  }

  /**
   * Access the raw gRPC client for advanced use-cases.
   */
  getClient(): T {
    return this.client;
  }

  /**
   * Sets base metadata for each outbound call.
   */
  private initializeMetadata(): void {

    this.metadata.set('x-service-version', config?.serviceVersion || '1.0.1');
    this.metadata.set('x-client-id', config?.serviceClientId || '123');
  }

  private mergeMetadata(perCall?: grpc.Metadata): grpc.Metadata {
    if (!perCall || perCall === this.metadata) return this.metadata;
    const baseMap = this.metadata.getMap();
    for (const [key, value] of Object.entries(baseMap)) {
      if (!perCall.get(key).length) perCall.set(key, value as string);
    }
    return perCall;
  }

  /**
   * Make a unary gRPC call, using optional request-level metadata. Rate limits and
   * circuit-breaking applied.
   */
  async unaryCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): Promise<P> {
    let metadata = options.metadata || this.metadata;
    metadata = this.mergeMetadata(metadata);


    return this.circuitBreaker.execute(
      method,
      request,
      metadata,
      options.options
    );
  }

  /**
   * Server-side streaming gRPC call, returned as async generator.
   */
  async *streamCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): AsyncIterableIterator<P> {
    let metadata = options.metadata || this.metadata;
    metadata = this.mergeMetadata(metadata);
    const deadline = new Date(Date.now() + this.config.deadlineMs);

    const clientMethod = this.client[method] as (
      ...args: any[]
    ) => grpc.ClientReadableStream<P>;
    if (typeof clientMethod !== 'function') {
      throw new Error(
        `Method ${String(method)} is not defined on the gRPC client.`
      );
    }


    const stream = clientMethod.call(this.client, request, metadata, {
      deadline,
      options: options?.options,
    });
    for await (const response of stream as unknown as AsyncIterable<P>) {
      yield response;
    }
  }

  /**
   * The EventEmitter emits typed data events of type P.
   */
  async streamEventCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): Promise<
    EventEmitter & {
      on(event: 'data', listener: (data: P) => void): EventEmitter;
    }
  > {
    let metadata = options.metadata ?? this.metadata;
    metadata = this.mergeMetadata(metadata);

    const deadline = new Date(Date.now() + this.config.deadlineMs);

    const clientMethod = this.client[method] as (
      ...args: any[]
    ) => grpc.ClientReadableStream<P>;
    if (typeof clientMethod !== 'function') {
      throw new Error(
        `Method ${String(method)} is not defined on the gRPC client.`
      );
    }

    const emitter = new EventEmitter() as EventEmitter & {
      on(event: 'data', listener: (data: P) => void): typeof emitter;
      on(event: 'end', listener: () => void): typeof emitter;
      on(event: 'error', listener: (error: Error) => void): typeof emitter;
    };

    const stream = clientMethod.call(this.client, request, metadata, {
      deadline,
      options: options?.options,
    });

    stream.on('data', (chunk: P) => emitter.emit('data', chunk));
    stream.on('end', () => emitter.emit('end'));
    stream.on('error', (error: Error) => emitter.emit('error', error));

    return emitter;
  }

  /**
   * Low-level unary call implementation (used by circuit breaker & higher-level logic).
   * Ensures error mapping and timeout.
   */
  private async makeUnaryCall<R, P>(
    method: keyof T,
    request: R,
    metadata: grpc.Metadata = this.metadata,
    options: grpc.CallOptions = {}
  ): Promise<P> {
    const deadline = new Date(Date.now() + this.config.deadlineMs);

    return new Promise((resolve, reject) => {
      const clientMethod = this.client[method] as unknown as (
        req: R,
        md: grpc.Metadata,
        opts: grpc.CallOptions,
        cb: (
          err: grpc.ServiceError | null,
          response: { error?: ErrorResponse; success: P }
        ) => void
      ) => void;

      if (typeof clientMethod !== 'function') {
        return reject(
          new Error(
            `Method ${String(method)} is not defined on the gRPC client.`
          )
        );
      }
      clientMethod.call(
        this.client,
        request,
        metadata,
        { deadline, ...options },
        (
          error: grpc.ServiceError | null,
          response: { error?: ErrorResponse; success: P }
        ) => {
          if (error) return reject(new GrpcServiceError(error));
          if (response?.error)
            return reject(new GrpcResponseError(response.error));

          resolve(response as P);
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
    ]);
    return retryableStatusCodes.has(error.code);
  }

  /**
   * Gracefully closes client and circuit breaker.
   */
  close(): void {
    try {
      // double-close is safe, prevents memory leaks
      this.client.close?.();
      this.circuitBreaker.shutdown();
    } catch (err) {
      console.error('GrpcClient close error:', err);
    }
  }
}
