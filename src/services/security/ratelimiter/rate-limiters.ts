import { rateLimiter } from '@/middlewares/rate-limiter.middleware';

/**
 * Login — 5 attempts per 60 seconds per IP.
 * After exhaustion the client must wait 60 s.
 */
export const loginRateLimiter = rateLimiter({
  points: 5,
  duration: 60,
  keyPrefix: 'rl_login',
  blockDuration: 60,
});

/**
 * Registration — 3 accounts per hour per IP.
 */
export const registerRateLimiter = rateLimiter({
  points: 3,
  duration: 3600,
  keyPrefix: 'rl_register',
  blockDuration: 3600,
});

/**
 * OTP verify + resend — 5 attempts per 5 minutes per IP.
 */
export const otpRateLimiter = rateLimiter({
  points: 5,
  duration: 300,
  keyPrefix: 'rl_otp',
  blockDuration: 300,
});

/**
 * Forgot password / password reset — 3 requests per hour per IP.
 */
export const forgotPasswordRateLimiter = rateLimiter({
  points: 3,
  duration: 3600,
  keyPrefix: 'rl_forgot_pwd',
  blockDuration: 3600,
});

/**
 * Email availability check — 10 per 60 seconds per IP (prevents enumeration).
 */
export const emailCheckRateLimiter = rateLimiter({
  points: 10,
  duration: 60,
  keyPrefix: 'rl_email_check',
});

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

/**
 * Admin operations — 30 requests per 60 seconds.
 * Tighter than the global limiter since admin actions are high-privilege.
 */
export const adminRateLimiter = rateLimiter({
  points: 30,
  duration: 60,
  keyPrefix: 'rl_admin',
});
