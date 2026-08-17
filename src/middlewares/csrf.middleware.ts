import { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';

import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_TOKEN_LENGTH,
} from '@/shared/constants/security.constance';

/**
 * Safe HTTP methods.
 *
 * These methods do not modify server state and therefore
 * do not require CSRF protection.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Only these endpoints bypass CSRF.
 *
 * IMPORTANT:
 *
 * Do NOT put:
 *
 *   /api/v1/auth
 *
 * here.
 *
 * Doing so would disable CSRF protection for every auth
 * mutation such as login/logout/password operations.
 */
const EXEMPT_PATHS = new Set([
  '/api/v1/auth/csrf-token',

  '/metrics',
  '/health',
  '/live',
]);

function normalizePath(url: string): string {
  return url.split('?')[0] ?? url;
}

function isExemptPath(url: string): boolean {
  const path = normalizePath(url);

  /**
   * Exact match for security-sensitive routes.
   */
  if (EXEMPT_PATHS.has(path)) {
    return true;
  }

  /**
   * Infrastructure endpoints.
   *
   * Only use prefix matching for routes that are genuinely
   * internal infrastructure endpoints.
   */
  return (
    path === '/metrics' ||
    path.startsWith('/metrics/') ||
    path === '/health' ||
    path.startsWith('/health/') ||
    path === '/live' ||
    path.startsWith('/live/')
  );
}

/**
 * Generate cryptographically secure CSRF token.
 *
 * 32 random bytes = 64 hexadecimal characters.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function isValidCsrfToken(token: unknown): token is string {
  return (
    typeof token === 'string' &&
    token.length === CSRF_TOKEN_LENGTH &&
    /^[a-f0-9]{64}$/i.test(token)
  );
}

/**
 * CSRF protection middleware.
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Safe methods
if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Exempt endpoints
  if (isExemptPath(req.originalUrl)) {
    return next();
  }

  // Read header
  const rawHeader = req.headers[CSRF_HEADER_NAME];

  const headerToken = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  // Read cookie
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  // Missing / malformed token
  if (!isValidCsrfToken(headerToken) || !isValidCsrfToken(cookieToken)) {
    res.status(403).json({
      success: false,

      message: 'CSRF token is required. Please refresh and try again.',

      error: {
        code: 'CSRF_TOKEN_MISSING',

        message: 'CSRF token is required. Please refresh and try again.',
      },
    });

    return;
  }

  // Constant-time comparison
  const headerBuffer = Buffer.from(headerToken, 'utf8');

  const cookieBuffer = Buffer.from(cookieToken, 'utf8');

  const tokensMatch =
    headerBuffer.length === cookieBuffer.length &&
    crypto.timingSafeEqual(headerBuffer, cookieBuffer);

  if (!tokensMatch) {
    res.status(403).json({
      success: false,

      message: 'Invalid CSRF token. Please refresh and try again.',

      error: {
        code: 'CSRF_TOKEN_INVALID',

        message: 'Invalid CSRF token. Please refresh and try again.',
      },
    });

    return;
  }

  // Valid
  next();
}
