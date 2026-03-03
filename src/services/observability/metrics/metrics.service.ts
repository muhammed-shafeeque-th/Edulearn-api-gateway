import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  httpErrorsTotal,
  gRPCRequestDurationSeconds,
  gRPCErrorsTotal,
} from './setup';
import {
  Counter,
  Histogram,
  Gauge,
  Summary,
  collectDefaultMetrics,
  Registry,
  register as globalRegister,
} from 'prom-client';

export interface MetricLabels {
  [key: string]: string | number;
}

import { injectable } from 'inversify';

@injectable()
export class MetricsService {
  private static instance: MetricsService;
  private readonly registry: Registry;

  private constructor() {
    this.registry = globalRegister;

    collectDefaultMetrics({ register: this.registry });
  }

  
  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public measureHttpRequestDuration(
    method: string,
    route: string,
    duration?: number
  ): void | ((statusCode: number) => void) {
    if (typeof duration === 'number') {
      httpRequestDurationSeconds.observe({ method, route }, duration);
      return;
    }
    const end = httpRequestDurationSeconds.startTimer({ method, route });
    return (statusCode: number) => {
      end({ status_code: statusCode.toString() });
    };
  }

  public measureGRPCRequestDuration(
    method: string,
    duration?: number,
    serviceTo?: string
  ): void | (() => void) {
    if (typeof duration === 'number') {
      gRPCRequestDurationSeconds.observe(
        { method, serviceTo, duration },
        duration
      );
      return;
    }
    const end = gRPCRequestDurationSeconds.startTimer({ method, serviceTo });
    return () => {
      end();
    };
  }

  public incrementHttpRequestCounter(
    method: string,
    route: string,
    statusCode?: number | string
  ): void {
    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode?.toString(),
    });
  }

  public incrementHttpErrorCounter(
    method: string,
    route: string,
    statusCode: number | string
  ): void {
    httpErrorsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  public incrementGrpcErrorCounter(
    method: string,
    errorName?: string,
    serviceTo?: string,
    code?: string
  ): void {
    gRPCErrorsTotal.inc({
      method,
      errorName,
      serviceTo,
      code,
    });
  }

  public incrementCounter(metricName: string, labels?: MetricLabels): void {
    const counter = this.registry.getSingleMetric(metricName);
    if (counter && counter instanceof Counter) {
      counter.inc({ ...labels });
    } else {
      console.warn(
        `[MetricsService] Counter metric '${metricName}' not found.`
      );
    }
  }

  public recordHistogram(
    metricName: string,
    value: number,
    labels?: MetricLabels
  ): void {
    const histogram = this.registry.getSingleMetric(metricName);
    if (histogram && histogram instanceof Histogram) {
      histogram.observe({ ...labels }, value);
    } else {
      console.warn(
        `[MetricsService] Histogram metric '${metricName}' not found.`
      );
    }
  }

  public setGauge(
    metricName: string,
    value: number,
    labels?: MetricLabels
  ): void {
    const metric = this.registry.getSingleMetric(metricName);
    if (metric && metric instanceof Gauge) {
      metric.set({ ...labels }, value);
    } else {
      console.warn(`[MetricsService] Gauge metric '${metricName}' not found.`);
    }
  }

  public observeSummary(
    metricName: string,
    value: number,
    labels?: MetricLabels
  ): void {
    const metric = this.registry.getSingleMetric(metricName);
    if (metric && metric instanceof Summary) {
      metric.observe({ ...labels }, value);
    } else {
      console.warn(
        `[MetricsService] Summary metric '${metricName}' not found.`
      );
    }
  }

  public removeMetric(metricName: string): void {
    try {
      this.registry.removeSingleMetric(metricName);
    } catch (err) {
      console.warn(
        `[MetricsService] Failed removing metric '${metricName}'.`,
        err
      );
    }
  }

  public async getMetrics(): Promise<string> {
    try {
      return this.registry.metrics();
    } catch (error) {
      console.error(
        '[MetricsService] Error while fetching prometheus metrics:',
        error
      );
      throw error;
    }
  }

  public resetAllMetrics(): void {
    this.registry.resetMetrics();
  }

  public listMetricNames(): string[] {
    return Object.keys(
      this.registry.getMetricsAsArray().reduce(
        (acc, m) => {
          acc[m.name] = true;
          return acc;
        },
        {} as Record<string, boolean>
      )
    );
  }
}
