import { HttpStatus } from '@/shared/constants/http-status';
import { CorsOptions } from 'cors';
import { config } from '@/config/dev-config';

const allowedOrigins = config.cors.allowedOrigins;
const allowedMethods = config.cors.allowedMethods;

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    // In development allow requests with no origin (curl, Postman, mobile).
    // In production all requests must originate from an allowed origin.
    if (!requestOrigin) {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: origin required in production'));
    }

    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
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
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
  optionsSuccessStatus: HttpStatus.NO_CONTENT,
  maxAge: 86400, // 24 hours
};

