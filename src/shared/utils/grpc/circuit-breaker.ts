import { LoggingService } from '@/services/observability/logging/logging.service';
import CircuitBreaker from 'opossum';

const logger = LoggingService.getInstance();

export interface CircuitBreakerConfig {
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
  volumeThreshold: number;
}

export const defaultCircuitBreakerConfig: CircuitBreakerConfig &
  CircuitBreaker.Options = {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 3000,
  volumeThreshold: Number.MAX_SAFE_INTEGER,
};

export class CircuitBreakerWrapper {
  private breaker: CircuitBreaker;

  constructor(
    fn: (...args: any[]) => Promise<any>,
    config: CircuitBreakerConfig = defaultCircuitBreakerConfig
  ) {
    this.breaker = new CircuitBreaker(fn, config);

    this.breaker.on('open', () => logger.info('Circuit breaker opened'));
    this.breaker.on('halfOpen', () => logger.info('Circuit breaker half '));
    this.breaker.on('close', () => logger.info('Circuit breaker closed'));
    this.breaker.on('failure', () => logger.info('Circuit breaker failure'));
  }

  async execute<T>(...args: any[]): Promise<T> {
    return this.breaker.fire(...args) as T;
  }

  shutdown(): void {
    this.breaker.shutdown();
  }
}
