import { collectDefaultMetrics, Counter, Gauge, Histogram } from "prom-client";

declare global {
  var defaultMetricsCollected: boolean;
}
let defaultMetricsCollected: boolean;

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
// Ensure default metrics are called only once
if (!global.defaultMetricsCollected) {
  collectDefaultMetrics();
  global.defaultMetricsCollected = true;
}


// Define custom metrics
export const httpRequestDurationSeconds = new Histogram({
  // Renamed for clarity
  name: "http_request_duration_seconds",
  help: "Duration of http requests in seconds",
  labelNames: ["method", "route", "status_code", "duration"], // Renamed 'code' to 'status_code' for semantic clarity
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // More granular buckets
});
// gRPC request duration
export const gRPCRequestDurationSeconds = new Histogram({
  name: "gRPC_request_duration_to_service_in_seconds",
  help: "Duration of gRPC requests in seconds",
  labelNames: ["method", "serviceFrom", "serviceTo"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // More granular buckets
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of http requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpErrorsTotal = new Counter({
  name: "http_errors_total",
  help: "Total number of http errors",
  labelNames: ["method", "route", "status_code"],
});

export const gRPCErrorsTotal = new Counter({
  name: "gRPC_errors_total",
  help: "Total number of gRPC errors",
  labelNames: ["method", "serviceFrom", "serviceTo", "code"],
});

// Add other custom metrics here as needed, e.g.,
// export const customBusinessCounter = new Counter({
//   name: "edulearn_course_enrollments_total",
//   help: "Total number of course enrollments",
//   labelNames: ["course_id", "user_id"],
// });
export const bloomFilterQueries = new Counter({
  name: "bloom_filter_queries_total",
  help: "Total number of Bloom filter queries",
  labelNames: ["result", "type"], // 'positive' or 'negative'
});

export const databaseQueries = new Counter({
  name: "database_email_queries_total",
  help: "Total number of database email checks",
});

export const bloomFilterErrors = new Counter({
  name: "bloom_filter_errors_total",
  help: "Total number of Bloom filter errors",
});

export const bloomFilterSize = new Gauge({
  name: "bloom_filter_size",
  help: "Current size of the Bloom filter in bits",
});

export const bloomFilterResponseTimes = new Histogram({
  name: "bloom_filter_response_times",
  help: "Response times for bloom filter availability checks",
  labelNames: ["stage", "type"], 
  buckets: [0.1, 0.5, 1, 2, 5], // in milliseconds
});
