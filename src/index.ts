import 'reflect-metadata';
import { GatewayApplication } from './app';
import { TYPES } from './services/di';
import { container } from './services/di/di.config';
import { ILoggerService } from './services/observability/interfaces';

container.loadSync();

const app: GatewayApplication = new GatewayApplication(
  container.get(TYPES.LoggerService),
  container.get(TYPES.CacheService),
  container.get(TYPES.HealthController),
  container.get(TYPES.MetricsEngine)
);
const logger: ILoggerService = container.get(TYPES.LoggerService);

process.on('SIGINT', async () => await app.shutdown());
process.on('SIGTERM', async () => await app.shutdown());

app.initialize().catch(error => {
  logger.error('Error while initializing app ', { error });
  process.exit(1);
});
