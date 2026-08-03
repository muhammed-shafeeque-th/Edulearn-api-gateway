export const TYPES = {
  // Core Services
  LoggerService: Symbol.for('LoggerService'),
  TracerProvider: Symbol.for('TracerProvider'),
  TraceService: Symbol.for('TraceService'),
  MetricService: Symbol.for('MetricService'),
  MetricsEngine: Symbol.for('MetricsEngine'),

  // Domain Services
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  WalletService: Symbol.for('WalletService'),
  EnrollmentService: Symbol.for('EnrollmentService'),
  ChatService: Symbol.for('ChatService'),
  CartService: Symbol.for('CartService'),
  OrderService: Symbol.for('OrderService'),
  PaymentService: Symbol.for('PaymentService'),
  WishlistService: Symbol.for('WishlistService'),
  CourseService: Symbol.for('CourseService'),
  NotificationService: Symbol.for('NotificationService'),

  // Infrastructure Services
  CacheService: Symbol.for('CacheService'),
  TokenService: Symbol.for('TokenService'),
  AccountAccessService: Symbol.for('AccountAccessService'),
  StorageService: Symbol.for('StorageService'),
  MediaService: Symbol.for('MediaService'),

  // Controllers
  AdminController: Symbol.for('AdminController'),
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
  InstructorController: Symbol.for('InstructorController'),
  CourseController: Symbol.for('CourseController'),
  CategoryController: Symbol.for('CategoryController'),
  EnrollmentController: Symbol.for('EnrollmentController'),
  ChatController: Symbol.for('ChatController'),
  DiscussionController: Symbol.for('DiscussionController'),
  WalletController: Symbol.for('WalletController'),
  CartController: Symbol.for('CartController'),
  WishlistController: Symbol.for('WishlistController'),
  NotificationController: Symbol.for('NotificationController'),
  MediaController: Symbol.for('MediaController'),
  OrderController: Symbol.for('OrderController'),
  PaymentController: Symbol.for('PaymentController'),

  // Health check
  HttpServer: Symbol.for('HttpServer'),
  RedisHealthCheck: Symbol.for('RedisHealthCheck'),
  HealthController: Symbol.for('HealthController'),
  MetricsController: Symbol.for('MetricsController'),
  
  Application: Symbol.for('Application'),
};
