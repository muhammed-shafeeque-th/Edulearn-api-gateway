import { CallOptions, ChannelCredentials, ChannelOptions, Metadata } from '@grpc/grpc-js';
import { RetryConfig } from '../../../services/security/retry/retry';
import { CircuitBreakerConfig } from './circuit-breaker';
import { RateLimiterConfig } from '../../../services/security/ratelimiter/rate-limiter';
import { Options } from '@grpc/proto-loader';

export interface GrpcClientConfig {
  protoPath: string;
  packageName: string;
  serviceName: string;
  host: string;
  port: number;
  loaderOptions?: Options;
  credentials?: ChannelCredentials;
  channelOptions?: ChannelOptions;
  deadlineMs?: number;
  keepAliveTimeoutMs?: number;
  maxMessageSize?: number;
  // retryConfig?: RetryConfig;
  circuitBreakerConfig?: CircuitBreakerConfig;
  rateLimiterConfig?: RateLimiterConfig;
}

export interface GrpcClientOptions {
  metadata?: Metadata;
  options?: CallOptions;
}
