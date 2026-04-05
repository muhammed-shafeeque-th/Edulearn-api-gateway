import {
  NodeTracerProvider,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import os from 'os';

import { resourceFromAttributes } from '@opentelemetry/resources';
import { config } from '@/config';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export function initializeTracer() {
  const {
    serviceName,
    nodeEnv,
    observability: {
      jaeger: { samplingRate, endpoint },
    },
  } = config;

  // Configure sampler based on environment
  const sampler =
    nodeEnv === 'production'
      ? new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(parseFloat(samplingRate || '0.1')),
        })
      : new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(1.0) });

  const otlpExporter = new OTLPTraceExporter({
    url: endpoint || 'http://localhost:4318/v1/traces',
  });

  const spanProcessor =
    nodeEnv === 'production'
      ? new BatchSpanProcessor(otlpExporter)
      : new SimpleSpanProcessor(otlpExporter);

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || 'unknown',
      [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
      [SemanticResourceAttributes.OS_TYPE]: os.type(),
      [SemanticResourceAttributes.OS_VERSION]: os.version(),
      [SemanticResourceAttributes.PROCESS_PID]: process.pid,
    }),
    sampler: sampler,
    spanProcessors: [spanProcessor],
  });

  provider.register();

  registerInstrumentations({
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Graceful shutdown for the tracer
  const shutdownTracer = async () => {
    console.info('Shutting down tracer...');
    await provider
      .shutdown()
      .then(() => console.info('Tracer shut down.'))
      .catch(err => console.error('Error shutting down tracer', err));
    process.exit(0);
  };

  process.on('SIGTERM', shutdownTracer);
  process.on('SIGINT', shutdownTracer);
}
