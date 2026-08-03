import { HttpStatus } from '@/shared/constants/http-status';
import { CorsOptions } from 'cors';
import { config } from '@/config/app.config';

const allowedOrigins = config.security.cors.allowedOrigins;
const allowedMethods = config.security.cors.allowedMethods;

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Requests without Origin are non-browser requests
    // (curl, Postman, mobile apps, server-to-server, health checks)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy violation'));
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'Idempotency-Key',
    'X-CSRF-Token',
  ],
  // Expose rate-limit and retry headers so clients can handle throttling gracefully
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
  optionsSuccessStatus: HttpStatus.NO_CONTENT,
  maxAge: 86400, // 24 hours
};
