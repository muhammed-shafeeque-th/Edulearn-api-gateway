import express, { Application } from 'express';
import { Server } from 'http';
import { routerV1 } from './routes/v1';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors';
import { corsOptions } from './services/security/cors';
import { helmetSecurity } from './services/security/helmet';
import cookieParser from 'cookie-parser';
import { rateLimiter } from './middlewares/rate-limiter.middleware';
import { csrfProtection } from './middlewares/csrf.middleware';
import { IKafkaProducerService } from './services/messaging/kafka/producer.service';
import { observabilityMiddleware } from './middlewares/observability.middleware';
import { compress } from './middlewares/compression';
import { BloomFilterFacade } from './services/bloom-filter';
import { UserService } from '@/domains/service-clients/user';
import { inject } from 'inversify';
import { ILoggerService } from './services/observability/interfaces';
import { RedisService } from './services/redis';
import { AppHealthController } from './services/health/health-server';
import { TYPES } from './services/di';
import { withRetry } from './services/security/retry/retryable';
import { config } from './config';
import { MetricsEngine } from './services/observability/implementations/metrics/setup';

export class GatewayApplication {
  private server: Application;
  private httpServer?: Server;
  private kafkaProducer?: IKafkaProducerService;
  private isShuttingDown = false;

  constructor(
    @inject(TYPES.LoggerService) private readonly _logger: ILoggerService,
    @inject(TYPES.CacheService) private readonly _cache: RedisService,
    @inject(TYPES.HealthController)
    private readonly _healthServer: AppHealthController,
    @inject(TYPES.MetricsEngine) private readonly _metricEngine: MetricsEngine
  ) {
    // container.loadSync()
    this.server = express();
  }

  async initialize(): Promise<void> {
    try {
      this._logger.info('Initializing API Gateway...');

      await this.initializeCache();
      await this.initializeUtils();

      this.registerMiddleware();

      this.initHealthServer();
      this.registerRoutes();
      this.registerErrorHandler();
      this.setupGlobalErrorHandlers();

      this.listen();

      this._logger.info('API Gateway initialized successfully');
    } catch (error) {
      this._logger.error('Failed to initialize application', { error });
      throw error;
    }
  }

  private registerMiddleware(): void {
    //  Trust proxy for accurate IP addresses
    this.server.set('trust proxy', 1);

    this.server.use(helmetSecurity);
    this.server.use(cors(corsOptions));

    this.server.use(
      express.json({
        limit: '1mb',
        verify: (req, res, buf) => {
          (req as any).rawBody = buf;
        },
      })
    );
    this.server.use(
      express.urlencoded({
        extended: true,
        limit: '1mb',
      })
    );

    // cookieParser must come before csrfProtection (CSRF reads cookies)
    this.server.use(cookieParser());

    // CSRF protection — double-submit cookie pattern (stateless, Cache-free)
    this.server.use(csrfProtection);

    this.server.use(compress);

    this.server.use(observabilityMiddleware);

    this.server.use(
      rateLimiter({
        points: config.security.rateLimiter.points,
        duration: config.security.rateLimiter.duration,
      })
    );

    this.server.disable('x-powered-by');
  }

  private async initHealthServer(): Promise<void> {
    try {
      // Initialize Kafka manager
      this._healthServer.initialize();
      this._logger.info('Health server initialized');
    } catch (error) {
      this._logger.error('Error while initializing health server ', { error });
      throw error;
    }
  }

  private async registerRoutes(): Promise<void> {
    try {
      this.server.use('/api/v1', routerV1);

      await this._metricEngine.start();

      // // 404 handler
      // this.server.use('*', (req, res) => {
      //   res.status(404).json({
      //     success: false,
      //     error: {
      //       code: 'NOT_FOUND',
      //       message: `Route ${req.method} ${req.originalUrl} not found`,
      //     },
      //   });
      // });
    } catch (error) {
      this._logger.error('Error registering routes', {
        error,
        ctx: GatewayApplication.name,
      });
      throw error;
    }
  }

  private registerErrorHandler(): void {
    this.server.use(errorHandler);
  }

  private async initializeCache(): Promise<void> {
    try {
      await this._cache.connect();
      this._logger.info('Cache connected successfully', {
        ctx: GatewayApplication.name,
      });
    } catch (error) {
      this._logger.error('Failed to connect to Cache', { error });
      throw error;
    }
  }

  private setupGlobalErrorHandlers(): void {
    process.on('unhandledRejection', (reason, promise) => {
      this._logger.error('Unhandled Rejection at:', {
        promise,
        reason,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      this._logger.info('SIGTERM received, shutting down gracefully');
      this.httpServer?.close(() => {
        this._logger.info('Server closed');
        this.shutdown();
      });
    });

    process.on('uncaughtException', error => {
      this._logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
      });

      // Wait for cleanup
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
  }

  private async initializeUtils(): Promise<void> {
    try {
      const bloomFilterService = BloomFilterFacade.getInstance(this._cache);
      withRetry(
        async () => {
          await bloomFilterService.initialize();

          this._logger.info('BloomFilter service initialized');
        },
        {
          onRetry: (error, attempt, delay) => {
            console.log(
              `Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms`
            );
          },
        }
      );
    } catch (error) {
      this._logger.error('Failed to initialize BloomFilter service', { error });
      throw error;
    }
  }

  private listen(): void {
    const PORT = config.port || 4000;
    this.httpServer = this.server.listen(PORT, () => {
      this._logger.info('API Gateway listening', {
        port: PORT,
        environment: config.nodeEnv || 'development',
        nodeVersion: process.version,
        platform: process.platform,
      });
    });
    // server errors
    this.httpServer.on('error', error => {
      this._logger.error('Server error', { error });
    });
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    this._logger.info('Shutting down API Gateway...');

    try {
      await UserService.shutdown();

      // Stop accepting new connections
      await new Promise<void>(resolve => {
        if (!this.httpServer) return resolve();
        this.httpServer.close(() => resolve());
      });

      // Close Cache connection
      await this._cache.disconnect();
      this._logger.info('Cache disconnected');

      await this._metricEngine.shutdown();
      this._logger.info('Metrics engine disconnected');

      // Close Kafka producer
      // await this.kafkaProducer?.disconnect();

      this._logger.info('API Gateway shutdown completed');
    } catch (error) {
      this._logger.error('Error during shutdown', { error });
    }
  }
}
