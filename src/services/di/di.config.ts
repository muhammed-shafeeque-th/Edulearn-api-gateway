import { Container } from 'inversify';
import { TYPES } from './types';

// Core Services
import { LoggingService } from '@/services/observability/logging/logging.service';
import { TracingService } from '@/services/observability/tracing/trace.service';
import { MetricsService } from '@/services/observability/metrics/metrics.service';

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
import { AuthController } from '@/domains/auth/controllers/v1/auth.controller';
import { UserController } from '@/domains/user/controllers/v1/user.controller';
import { CourseController } from '@/domains/course/controllers/v1/course.controller';

import { TokenService } from '@/services/token.service';
import { PaymentService } from '@/domains/service-clients/payment';
import { OrderService } from '@/domains/service-clients/order';
import { WishlistService } from '@/domains/service-clients/wishlist';
import { CartService } from '@/domains/service-clients/cart';
import { PaymentController } from '@/domains/payment/controllers/v1/payment.controller';
import { OrderController } from '@/domains/order/controllers/v1/order.controller';
import { EnrollmentController } from '@/domains/enrollment/controllers/v1/enrollment.controller';
import { WalletController } from '@/domains/wallet/controllers/v1/wallet.controller';
import { WishlistController } from '@/domains/wishlist/controllers/v1/wishlist.controller';
import { ChatController } from '@/domains/chat/controllers/v1/chat.controller';
import { DiscussionController } from '@/domains/chat/controllers/v1/discussion.controller';
import { MediaController } from '@/domains/media/controllers/v1/media.controller';
import { UserAccessService } from '../user-blocklist.service';
import { AdminController } from '@/domains/admin/controllers/v1/admin.controller';
import { CartController } from '@/domains/cart/controllers/v1/cart.controller';
import { NotificationController } from '@/domains/notification/controllers/v1/notification.controller';

const container = new Container();

// Bind Core Services
container
  .bind<LoggingService>(TYPES.LoggingService)
  .toDynamicValue(context => {
    return LoggingService.getInstance();
  })
  .inSingletonScope();
container
  .bind<TracingService>(TYPES.TracingService)
  .toDynamicValue(context => {
    return TracingService.getInstance();
  })
  .inSingletonScope();
container
  .bind<MetricsService>(TYPES.MetricsService)
  .toDynamicValue(context => {
    return MetricsService.getInstance();
  })
  .inSingletonScope();

// Bind Infrastructure Services
container
  .bind<RedisService>(TYPES.RedisService)
  .toDynamicValue(context => RedisService.getInstance())
  .inSingletonScope();
container
  .bind<TokenService>(TYPES.TokenService)
  .to(TokenService)
  .inSingletonScope();
container
  .bind<UserAccessService>(TYPES.UserAccessService)
  .to(UserAccessService)
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

export { container };
