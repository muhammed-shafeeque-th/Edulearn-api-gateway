import { config } from '@/config';
import { inject, injectable } from 'inversify';
import {
  CounterMetric,
  CounterOptions,
  GaugeMetric,
  GaugeOptions,
  HistogramMetric,
  HistogramOptions,
  MetricsEngine as Engine,
  MetricService,
  SummaryMetric,
  SummaryOptions,
  createMetrics,
} from '@edulearn/core';
import { TYPES } from '@/services/di';
import { Server } from 'http';

@injectable()
export class MetricsEngine {
  private readonly _engine: Engine;
  httpRequestDurationSeconds: HistogramMetric;
  gRPCRequestDurationSeconds: HistogramMetric;
  httpRequestsTotal: CounterMetric;
  httpErrorsTotal: CounterMetric;
  gRPCErrorsTotal: CounterMetric;
  bloomFilterQueries: CounterMetric;
  databaseQueries: CounterMetric;
  bloomFilterErrors: CounterMetric;
  bloomFilterSize: GaugeMetric;
  bloomFilterResponseTimes: HistogramMetric;

  constructor(@inject(TYPES.HttpServer) server: Server) {
    this._engine = createMetrics({
      server,
      enabled: true,
      namespace: config.serviceName,
    });

    this.httpRequestDurationSeconds = this._engine.histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of http requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'duration'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    this.gRPCRequestDurationSeconds = this._engine.histogram({
      name: 'gRPC_request_duration_to_service_in_seconds',
      help: 'Duration of gRPC requests in seconds',
      labelNames: ['method', 'serviceTo', 'duration'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    this.httpRequestsTotal = this._engine.counter({
      name: 'http_requests_total',
      help: 'Total number of http requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpErrorsTotal = this._engine.counter({
      name: 'http_errors_total',
      help: 'Total number of http errors',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.gRPCErrorsTotal = this._engine.counter({
      name: 'gRPC_errors_total',
      help: 'Total number of gRPC errors',
      labelNames: ['method', 'serviceTo', 'code', 'errorName'],
    });

    this.bloomFilterQueries = this._engine.counter({
      name: 'bloom_filter_queries_total',
      help: 'Total number of Bloom filter queries',
      labelNames: ['result', 'type'],
    });

    this.databaseQueries = this._engine.counter({
      name: 'database_email_queries_total',
      help: 'Total number of database email checks',
    });

    this.bloomFilterErrors = this._engine.counter({
      name: 'bloom_filter_errors_total',
      help: 'Total number of Bloom filter errors',
    });

    this.bloomFilterSize = this._engine.gauge({
      name: 'bloom_filter_size',
      help: 'Current size of the Bloom filter in bits',
    });

    this.bloomFilterResponseTimes = this._engine.histogram({
      name: 'bloom_filter_response_times',
      help: 'Response times for bloom filter availability checks',
      labelNames: ['stage', 'type'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });
  }

  public get engine() {
    return this._engine;
  }

  public async start(): Promise<void> {
    await this._engine.initialize();
  }

  public async shutdown() {
    await this._engine.shutdown();
  }
}
