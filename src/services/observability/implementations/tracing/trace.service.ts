import { TracerService } from '@edulearn/core';
import { TSpan, TNodeTracerProvider } from '@edulearn/core';
import { inject, injectable } from 'inversify';
import { ITraceService, TSpanStatusCode } from '../../interfaces';
import { TYPES } from '@/services/di';
import { config } from '@/config';

@injectable()
export class TraceService extends TracerService implements ITraceService {
  public constructor(
    @inject(TYPES.TracerProvider) traceProvider: TNodeTracerProvider
  ) {
    super(traceProvider.getTracer(config.serviceName));
  }

  recordException(span: TSpan, error: any): void {
    span.recordException(error);
    span.setStatus({ code: TSpanStatusCode.ERROR as any, message: error.message });
  }

  setStatus(span: TSpan, code: any, message?: string): void {
    span.setStatus({ code: code as any , message });
  }

  setAttribute(span: TSpan, key: string, value: any): void {
    span.setAttribute(key, value);
  }
}
