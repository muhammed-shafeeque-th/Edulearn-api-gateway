import dotenv from 'dotenv';

// Only enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ debug: true });
}

export const config = {
  port: (process.env.PORT as string) || 4000,
  redis: {
    host: process.env.REDIS_HOST as string,
    cluster: process.env.IS_CLUSTER as string,
    port: process.env.REDIS_PORT || '6379',
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS,
    db: process.env.REDIS_DB || '0',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'edulearn:api_gateway:',
    connectTimeout: process.env.REDIS_CONNECTION_TIMEOUT,
    lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true',
    maxRetriesPerRequest: process.env.REDIS_MAX_RETRIES,
  },
  serviceName: process.env.SERVICE_NAME as string,
  serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
  serviceClientId: process.env.SERVICE_NAME || 'api-gateway',
  jwt: {
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY as string,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY as string,
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    tokenIssuer: process.env.JWT_TOKEN_ISSUER || 'auth-service',
    tokenAudience: process.env.JWT_TOKEN_AUDIENCE || 'edulearn',
    cookieDomain: process.env.JWT_TOKEN_DOMAIN,
  },
  nodeEnv: process.env.NODE_ENV as string,
  grpc: {
    services: {
      authService: process.env.AUTH_SERVICE_GRPC || 'localhost:50051',
      userServiceClient: process.env.USER_SERVICE_GRPC || 'localhost:50052',
      courseService: process.env.COURSE_SERVICE_GRPC || 'localhost:50053',
      paymentService: process.env.PAYMENT_SERVICE_GRPC || 'localhost:50055',
      orderService: process.env.ORDER_SERVICE_GRPC || 'localhost:50054',
      chatService: process.env.CHAT_SERVICE_GRPC || 'localhost:50059',
      sessionService: process.env.SESSION_SERVICE_GRPC || 'localhost:50057',
      notificationService:
        process.env.NOTIFICATION_SERVICE_GRPC || 'localhost:50056',
    },
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  s3: {
    region: process.env.AWS_S3_REGION!,
    accessKey: process.env.AWS_S3_API_KEY!,
    accessSecret: process.env.AWS_S3_API_SECRET!,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
    secureBucketName: process.env.AWS_S3_SECURE_BUCKET_NAME!,
    secureRegion: process.env.AWS_S3_SECURE_REGION!,
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'edulearn-api-gateway',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092,').split(','),
    ssl: process.env.KAFKA_SSL === 'true',
    sals: {
      mechanism: 'plain',
      username: process.env.KAFKA_SASL_USERNAME,
      password: process.env.KAFKA_SASL_PASSWORD,
    },
  },
  observability: {
    tracer: {
      samplingRate: process.env.TRACE_SAMPLING_RATE,
      collectorUrl: process.env.OTLP_ENDPOINT ?? "http://otel-collector:8473/api/traces",
    },
    metrics: {
      path: process.env.METRICS_PATH,
    },

    logger: {
      logLevel: process.env.LOG_LEVEL,
    },
  },
  security: {
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:9000',
      ],
      allowedMethods: process.env.ALLOWED_METHODS?.split(',') || [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
      ],
    },
    rateLimiter: {
      points: parseInt(process.env.RATE_LIMIT_POINTS || '100'),
      duration: parseInt(process.env.RATE_LIMIT_DURATION || '60'),
    },
  },

  httpPort: process.env.HTTP_PORT ?? 3000,
};
