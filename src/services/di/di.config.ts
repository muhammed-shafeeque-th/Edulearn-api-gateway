import { Container } from 'inversify';
import { TYPES } from './types';

// Core Services
import {
  LoggerService,
  MetricService,
  TraceService,
} from '../observability/implementations';
import { ITraceService } from '../observability/interfaces/trace.service';
import { ILoggerService } from '../observability/interfaces/logger.service';
import { IMetricService } from '../observability/interfaces/metric.interface';

// Domain Services
import { AuthService } from '@/domains/service-clients/auth';
import { UserService } from '@/domains/service-clients/user';
import { NotificationService } from '@/domains/service-clients/notification';
import { WalletService } from '@/domains/service-clients/wallet';
import { EnrollmentService } from '@/domains/service-clients/enrollment';
import { ChatService } from '@/domains/service-clients/chat';
import { CourseService } from '@/domains/service-clients/course';

// Infrastructure Services
import { RedisService } from '@/services/redis';

// Controllers
import { AuthController } from '@/domains/auth/v1/controllers';
import { UserController } from '@/domains/user/v1/controllers/user.controller';
import { CourseController } from '@/domains/course/v1/controllers/course.controller';
import { CategoryController } from '@/domains/course/v1/controllers/category.controller';

import { TokenService } from '@/services/auth-token/token.service';
import { PaymentService } from '@/domains/service-clients/payment';
import { OrderService } from '@/domains/service-clients/order';
import { WishlistService } from '@/domains/service-clients/wishlist';
import { CartService } from '@/domains/service-clients/cart';
import { PaymentController } from '@/domains/payment/v1/controllers';
import { OrderController } from '@/domains/order/v1/controllers';
import { EnrollmentController } from '@/domains/enrollment/v1/controllers';
import { WalletController } from '@/domains/user/v1/controllers/wallet.controller';
import { WishlistController } from '@/domains/user/v1/controllers/wishlist.controller';
import { ChatController } from '@/domains/chat/v1/controllers/chat.controller';
import { DiscussionController } from '@/domains/chat/v1/controllers/discussion.controller';
import { MediaController } from '@/domains/media/v1/controllers';
import { AccountAccessService } from '../account-access.service';
import { AdminController } from '@/domains/admin/v1/controllers';
import { CartController } from '@/domains/user/v1/controllers/cart.controller';
import { NotificationController } from '@/domains/notification/v1/controllers';
import {
  initializeTracer,
  registerShutdown as shutdownTracer,
} from '@edulearn/core';
import { config } from '@/config';
import { RedisHealthCheck } from '../health/checks/redis.check';
import { AppHealthController } from '../health/health-server';
import { GatewayApplication } from '@/app';
import { createServer } from 'http';
import { MetricsEngine } from '../observability/implementations/metrics/setup';
import { S3StorageService } from '../media/storage.service';
import { CloudinaryMediaService } from '../media/media.service';
import { IMediaService } from '../media/interfaces/media.interface';

const container = new Container();

container
  .bind<ReturnType<typeof initializeTracer>>(TYPES.TracerProvider)
  .toDynamicValue(() =>
    initializeTracer({
      environment: String(config.nodeEnv),
      serviceName: String(config.serviceName),
      collectorUrl: String(config.observability.tracer.collectorUrl),
    })
  )
  .inSingletonScope();
shutdownTracer(container.get(TYPES.TracerProvider));

// Bind Core Services
container
  .bind<ILoggerService>(TYPES.LoggerService)
  .toDynamicValue(context => {
    return LoggerService.getInstance();
  })
  .inSingletonScope();
container
  .bind<ITraceService>(TYPES.TraceService)
  .to(TraceService)
  .inSingletonScope();

container.bind(TYPES.MetricsEngine).to(MetricsEngine).inSingletonScope();
container
  .bind<IMetricService>(TYPES.MetricService)
  .to(MetricService)
  .inSingletonScope();

// Bind Infrastructure Services
container
  .bind<RedisService>(TYPES.CacheService)
  .to(RedisService)
  .inSingletonScope();
container
  .bind<TokenService>(TYPES.TokenService)
  .to(TokenService)
  .inSingletonScope();
container
  .bind<AccountAccessService>(TYPES.AccountAccessService)
  .to(AccountAccessService)
  .inSingletonScope();
container
  .bind<S3StorageService>(TYPES.StorageService)
  .to(S3StorageService)
  .inSingletonScope();
container
  .bind<IMediaService>(TYPES.MediaService)
  .to(CloudinaryMediaService)
  .inSingletonScope();

// Bind Domain Services
container
  .bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<UserService>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope();
container
  .bind<NotificationService>(TYPES.NotificationService)
  .to(NotificationService)
  .inSingletonScope();
container
  .bind<WalletService>(TYPES.WalletService)
  .to(WalletService)
  .inSingletonScope();
container
  .bind<EnrollmentService>(TYPES.EnrollmentService)
  .to(EnrollmentService)
  .inSingletonScope();
container
  .bind<ChatService>(TYPES.ChatService)
  .to(ChatService)
  .inSingletonScope();
container
  .bind<CourseService>(TYPES.CourseService)
  .to(CourseService)
  .inSingletonScope();
container
  .bind<PaymentService>(TYPES.PaymentService)
  .to(PaymentService)
  .inSingletonScope();
container
  .bind<OrderService>(TYPES.OrderService)
  .to(OrderService)
  .inSingletonScope();
container
  .bind<WishlistService>(TYPES.WishlistService)
  .to(WishlistService)
  .inSingletonScope();
container
  .bind<CartService>(TYPES.CartService)
  .to(CartService)
  .inSingletonScope();

// Bind Controllers
container
  .bind<AdminController>(TYPES.AdminController)
  .to(AdminController)
  .inTransientScope();
container
  .bind<AuthController>(TYPES.AuthController)
  .to(AuthController)
  .inTransientScope();
container
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inTransientScope();
container
  .bind<CourseController>(TYPES.CourseController)
  .to(CourseController)
  .inTransientScope();
container
  .bind<CategoryController>(TYPES.CategoryController)
  .to(CategoryController)
  .inTransientScope();
container
  .bind<PaymentController>(TYPES.PaymentController)
  .to(PaymentController)
  .inTransientScope();
container
  .bind<OrderController>(TYPES.OrderController)
  .to(OrderController)
  .inTransientScope();
container
  .bind<EnrollmentController>(TYPES.EnrollmentController)
  .to(EnrollmentController)
  .inTransientScope();
container
  .bind<WalletController>(TYPES.WalletController)
  .to(WalletController)
  .inTransientScope();
container
  .bind<NotificationController>(TYPES.NotificationController)
  .to(NotificationController)
  .inTransientScope();
container
  .bind<WishlistController>(TYPES.WishlistController)
  .to(WishlistController)
  .inTransientScope();
container
  .bind<ChatController>(TYPES.ChatController)
  .to(ChatController)
  .inTransientScope();
container
  .bind<DiscussionController>(TYPES.DiscussionController)
  .to(DiscussionController)
  .inTransientScope();
container
  .bind<CartController>(TYPES.CartController)
  .to(CartController)
  .inTransientScope();
container
  .bind<MediaController>(TYPES.MediaController)
  .to(MediaController)
  .inTransientScope();

// Servers
container
  .bind(TYPES.HttpServer)
  .toDynamicValue(() => {
    return createServer().listen(config.httpPort, () =>
      console.log(`HttpServer listening on ${config.httpPort}`)
    );
  })
  .inSingletonScope();
container.bind(TYPES.HealthController).to(AppHealthController).inSingletonScope();

// Health check
container.bind(TYPES.RedisHealthCheck).to(RedisHealthCheck);

// App
// container.bind(TYPES.Application).to(GatewayApplication);

export { container };
