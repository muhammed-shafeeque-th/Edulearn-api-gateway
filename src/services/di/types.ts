export const TYPES = {
  // Core Services
  LoggingService: Symbol.for('LoggingService'),
  TracingService: Symbol.for('TracingService'),
  MetricsService: Symbol.for('MetricsService'),

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
  RedisService: Symbol.for('RedisService'),
  TokenService: Symbol.for('TokenService'),
  AccountAccessService: Symbol.for('AccountAccessService'),

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
};
