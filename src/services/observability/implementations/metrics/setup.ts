import {  Counter, Gauge, Histogram } from 'prom-client';

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of http requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'duration'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const gRPCRequestDurationSeconds = new Histogram({
  name: 'gRPC_request_duration_to_service_in_seconds',
  help: 'Duration of gRPC requests in seconds',
  labelNames: ['method', 'serviceTo', 'duration'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of http requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total number of http errors',
  labelNames: ['method', 'route', 'status_code'],
});

export const gRPCErrorsTotal = new Counter({
  name: 'gRPC_errors_total',
  help: 'Total number of gRPC errors',
  labelNames: ['method', 'serviceTo', 'code', 'errorName'],
});

export const bloomFilterQueries = new Counter({
  name: 'bloom_filter_queries_total',
  help: 'Total number of Bloom filter queries',
  labelNames: ['result', 'type'],
});

export const databaseQueries = new Counter({
  name: 'database_email_queries_total',
  help: 'Total number of database email checks',
});

export const bloomFilterErrors = new Counter({
  name: 'bloom_filter_errors_total',
  help: 'Total number of Bloom filter errors',
});

export const bloomFilterSize = new Gauge({
  name: 'bloom_filter_size',
  help: 'Current size of the Bloom filter in bits',
});

export const bloomFilterResponseTimes = new Histogram({
  name: 'bloom_filter_response_times',
  help: 'Response times for bloom filter availability checks',
  labelNames: ['stage', 'type'],
  buckets: [0.1, 0.5, 1, 2, 5],
});
