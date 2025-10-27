import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  httpErrorsTotal,
  gRPCRequestDurationSeconds,
  gRPCErrorsTotal,
} from './setup';
import {Counter, Histogram, register} from 'prom-client'; // Import for register

interface MetricLabels {
  [key: string]: string | number;
}

export class MetricsService {
  private static instance: MetricsService;

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  // Measure duration http requests
  measureHttpRequestDuration(
    method: string,
    route: string,
    duration?: number
  ): (statusCode: number) => void;
  measureHttpRequestDuration(method: string, route: string, duration?: number): void |  ((statusCode: number) => void) {
    if (duration) {
      httpRequestDurationSeconds.observe({ method, route }, duration);
      return;
    }
    const end = httpRequestDurationSeconds.startTimer({ method, route });
    return (statusCode: number) => {
      end({ status_code: statusCode.toString() }); // Ensure status code is a string label
    };
  }
  // Measure duration Grpc requests
  measureGRPCRequestDuration(
    method: string,
    serviceFrom: string,
    serviceTo: string
  ): () => void {
    const end = gRPCRequestDurationSeconds.startTimer({
      method,
      serviceFrom,
      serviceTo,
    });
    return () => {
      end(); // Ensure status code is a string label
    };
  }

  incrementHttpRequestCounter(
    method: string,
    route: string,
    statusCode: number
  ): void {
    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  incrementHttpErrorCounter(
    method: string,
    route: string,
    statusCode: number
  ): void {
    httpErrorsTotal.inc({ method, route, status_code: statusCode.toString() });
  }
  incrementGrpcErrorCounter(
    method: string,
    serviceFrom: string,
    serviceTo: string,
    code: string
  ): void {
    gRPCErrorsTotal.inc({ method, serviceFrom, serviceTo, code });
  }

  // Generic counter increment for custom metrics (requires pre-defined metric instance)
  // Best practice: Inject specific metric instances or use a factory if many custom metrics.
  incrementCounter(metricName: string, labels?: MetricLabels): void {
    // This method assumes you have a way to get the specific Counter instance by name.
    const counter = register.getSingleMetric(metricName);
    if (counter && counter instanceof Counter) {
      counter.inc({ ...labels });
    } else {
      console.warn(
        `Counter '${metricName}' not found or not a Counter instance.`
      );
    }
  }
  // Generic histogram record for custom metrics (requires pre-defined metric instance)
  recordHistogram(
    metricName: string,
    value: number,
    labels?: MetricLabels
  ): void {
    const histogram = register.getSingleMetric(metricName);
    if (histogram && histogram instanceof Histogram) {
      histogram.observe({ ...labels }, value);
    } else {
      console.warn(
        `Histogram '${metricName}' not found or not a Histogram instance.`
      );
    }
  }

  // Expose metrics for Prometheus to scrape
  async getMetrics(): Promise<string> {
    try {
      return register.metrics();
    } catch (error) {
      console.error('Error while fetching prometheus metrics', error);
      throw error;
    }
  }
}
