import winston, { format, transports } from 'winston';
import LokiTransport from 'winston-loki';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@/config';
import util from 'util';

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return util.inspect(obj, { depth: 3, colors: false });
  }
}

const {
  serviceName,
  nodeEnv,
  observability: {
    loki: { url: lokiUrl },
    logger: { logLevel },
  },
} = config;

const lokiTransport = new LokiTransport({
  host: lokiUrl || 'http://loki:3100',
  labels: { app: serviceName || 'default-service ' },
  json: true, 
  batching: true,
  interval: 5000,
});

const customConsoleFileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  format.errors({ stack: true }),
  format.metadata({ fillExcept: ['timestamp', 'level', 'message', 'stack'] }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const colorizer = format.colorize();
    const coloredLevel = colorizer.colorize(level, level.toUpperCase());
    const msg = stack ? `${message}\n${stack}` : message;

    const metaString =
      meta.metadata && Object.keys(meta.metadata).length > 0
        ? ` ${safeStringify(meta.metadata)}`
        : '';
    return `[${timestamp}] [${coloredLevel}]: ${msg}${metaString}`;
  })
);

const dailyRotateFileTransport = new DailyRotateFile({
  filename: `logs/${serviceName}-%DATE%-combined.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.json(),
});

const consoleTransport = new transports.Console({
  handleExceptions: true,
  format: format.combine(format.colorize(), format.simple()),
});

const logger = winston.createLogger({
  level: logLevel || 'info',

  format: nodeEnv === 'production' ? format.json() : customConsoleFileFormat,
  transports: [consoleTransport, dailyRotateFileTransport, lokiTransport],
  exitOnError: false,
});

const shutdownLogger = async () => {
  console.info('Flushing logs before shutdown...');

  await new Promise(resolve => setTimeout(resolve, 1000));
  logger.end(() => {
    console.info('Logs flushed. Exiting.');
    process.exit(0);
  });
};

process.on("SIGINT", shutdownLogger);
process.on("SIGTERM", shutdownLogger);

export { logger, shutdownLogger };
