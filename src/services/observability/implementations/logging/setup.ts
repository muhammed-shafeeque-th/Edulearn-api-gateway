import { config } from '@/config';
import { createLogger, getEnvs, shutdownLogger } from '@edulearn/core';

const logger = createLogger({
  level: config.observability.logger.logLevel,
  serviceName: config.serviceName.toString(),
  environment: config.nodeEnv.toString(),
});

shutdownLogger(logger);

export { logger };
