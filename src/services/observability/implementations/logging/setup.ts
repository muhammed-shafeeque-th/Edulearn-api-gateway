import { config } from '@/config';
import { createLogger, getEnvs, shutdownLogger } from '@edulearn/core';

const logger = createLogger({
  level: config.observability.logger.logLevel,
  serviceName: config.serviceName.toString(),
  environment: config.nodeEnv.toString(),
  

});

process.on('SIGINT', () => shutdownLogger(logger));
process.on('SIGTERM', () => shutdownLogger(logger));

export { logger };
