import { inject, injectable } from 'inversify';
import {
  IMetricService,
  MetricLabels,
} from '../../interfaces/metric.interface';
import { TYPES } from '@/services/di';
import { MetricsEngine } from './setup';

@injectable()
export class MetricService implements IMetricService {
  public constructor(
    @inject(TYPES.MetricsEngine) private metricsEngine: MetricsEngine
  ) {
    
  }

  public measureHttpRequestDuration(
    method: string,
    route: string,
    duration?: number
  ): void | ((statusCode: number) => void) {
    if (typeof duration === 'number') {
      this.metricsEngine.httpRequestDurationSeconds.observe(
        { method, route },
        duration
      );
      return;
    }
    const end = this.metricsEngine.httpRequestDurationSeconds.startTimer({
      method,
      route,
    });
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
      this.metricsEngine.gRPCRequestDurationSeconds.observe(
        { method, serviceTo, duration },
        duration
      );
      return;
    }
    const end = this.metricsEngine.gRPCRequestDurationSeconds.startTimer({
      method,
      serviceTo,
    });
    return () => {
      end();
    };
  }

  public incrementHttpRequestCounter(
    method: string,
    route: string,
    statusCode?: number | string
  ): void {
    this.metricsEngine.httpRequestsTotal.inc({
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
    this.metricsEngine.httpErrorsTotal.inc({
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
    this.metricsEngine.gRPCErrorsTotal.inc({
      method,
      errorName,
      serviceTo,
      code,
    });
  }

  public incrementCounter(metricName: string, labels?: MetricLabels): void {
    const counter = this.metricsEngine.engine.counter({
      name: metricName,
      help: 'custom_counter',
    });
    counter.inc({ ...labels });
  }


}
