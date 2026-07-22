import {
  LoggerService,
  MetricService,
} from '@/services/observability/implementations';
import { performance } from 'perf_hooks';

const logger = LoggerService.getInstance();
const metrics = MetricService.getInstance();

interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
  memoryDelta: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  private constructor() {
    // Start memory monitoring
    this.startMemoryMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure the performance of an async operation
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();

    try {
      const result = await fn();
      const endTime = performance.now();
      const memoryAfter = process.memoryUsage();

      this.recordMetric({
        operation,
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        timestamp: Date.now(),
      });

      logger.debug(`Operation completed: ${operation}`, {
        operation,
        duration: endTime - startTime,
        memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        ...context,
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      logger.error(`Operation failed: ${operation}`, {
        operation,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...context,
      });
      throw error;
    }
  }

  /**
   * Measure the performance of a synchronous operation
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();

    try {
      const result = fn();
      const endTime = performance.now();
      const memoryAfter = process.memoryUsage();

      this.recordMetric({
        operation,
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        timestamp: Date.now(),
      });

      logger.debug(`Operation completed: ${operation}`, {
        operation,
        duration: endTime - startTime,
        memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        ...context,
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      logger.error(`Operation failed: ${operation}`, {
        operation,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...context,
      });
      throw error;
    }
  }

  /**
   * Create a performance decorator for class methods
   */
  static measure(operation?: string) {
    return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor
    ) {
      const method = descriptor.value;
      const operationName =
        operation || `${target.constructor.name}.${propertyName}`;

      descriptor.value = async function (...args: any[]) {
        const monitor = PerformanceMonitor.getInstance();
        return monitor.measureAsync(operationName, () =>
          method.apply(this, args)
        );
      };
    };
  }

  /**
   * Get performance statistics
   */
  getStats(operation?: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    avgMemoryDelta: number;
    totalMemoryDelta: number;
  } {
    const filteredMetrics = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        avgMemoryDelta: 0,
        totalMemoryDelta: 0,
      };
    }

    const durations = filteredMetrics.map(m => m.duration);
    const memoryDeltas = filteredMetrics.map(m => m.memoryDelta);

    return {
      count: filteredMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      avgMemoryDelta:
        memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      totalMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  /**
   * Get memory-intensive operations
   */
  getMemoryIntensiveOperations(
    threshold: number = 1024 * 1024
  ): PerformanceMetrics[] {
    return this.metrics.filter(m => m.memoryDelta > threshold);
  }

  /**
   * Clear old metrics
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Record to monitoring service
    // monitoring.recordOperationDuration(metric.operation, metric.duration);
    // monitoring.recordMemoryUsage(metric.operation, metric.memoryDelta);
  }

  /**
   * Start periodic memory monitoring
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const rssMB = Math.round(memUsage.rss / 1024 / 1024);

      // Log warning if memory usage is high
      if (heapUsedMB > 500) {
        logger.warn('High memory usage detected', {
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${heapTotalMB}MB`,
          rss: `${rssMB}MB`,
        });
      }

      // Record memory metrics
      // monitoring.recordSystemMemoryUsage(heapUsedMB, heapTotalMB, rssMB);
    }, 30000); // Every 30 seconds
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    if (global.gc) {
      global.gc();
      logger.info('Garbage collection forced');
    } else {
      logger.warn(
        'Garbage collection not available. Start with --expose-gc flag'
      );
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
