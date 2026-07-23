export interface MetricLabels {
  [key: string]: string | number;
}

export interface IMetricService {
  /**
   * Measure request duration for a DB operation.
   * @param {string} method - The Name of the method
   * @param {LogContext} [operation] - Optional operation category
   */

  measureHttpRequestDuration(
    method: string,
    route: string,
    duration?: number
  ): void | ((statusCode: number) => void);

  measureGRPCRequestDuration(
    method: string,
    duration?: number,
    serviceTo?: string
  ): void | (() => void);

  incrementHttpRequestCounter(
    method: string,
    route: string,
    statusCode?: number | string
  ): void;

  incrementHttpErrorCounter(
    method: string,
    route: string,
    statusCode: number | string
  ): void;

  incrementGrpcErrorCounter(
    method: string,
    errorName?: string,
    serviceTo?: string,
    code?: string
  ): void;

  incrementCounter(metricName: string, labels?: MetricLabels): void;

  recordHistogram(
    metricName: string,
    value: number,
    labels?: MetricLabels
  ): void;

  setGauge(metricName: string, value: number, labels?: MetricLabels): void;

  observeSummary(
    metricName: string,
    value: number,
    labels?: MetricLabels
  ): void;

  removeMetric(metricName: string): void;

  getMetrics(): Promise<string>;

  resetAllMetrics(): void;
  listMetricNames(): string[];
}
