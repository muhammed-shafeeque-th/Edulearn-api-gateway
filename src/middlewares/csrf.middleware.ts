import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = '__Host-csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * CSRF-safe methods — no token needed for read-only requests
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * URL prefixes that are exempt from CSRF validation.
 *
 * Rules:
 * - GET /api/v1/auth/csrf-token  — the token issuance endpoint itself
 * - POST /api/v1/auth/refresh    — stateless cookie-only flow; no forgeable body state
 * - /metrics, /health, /live     — internal infra endpoints (not user-reachable in prod)
 *
 * NOTE: We match against req.originalUrl (the full path) because at global middleware
 * level req.path is always '/' — only route-specific middleware sees the sub-path.
 */
const EXEMPT_PREFIXES: string[] = [
  '/api/v1/auth/csrf-token',
  '/api/v1/auth',
  '/metrics',
  '/health',
  '/live',
];

function isExemptPath(url: string): boolean {
  const path = url.split('?')[0] ?? url; // strip query string, guaranteed non-undefined
  return EXEMPT_PREFIXES.some(
    prefix => path === prefix || path.startsWith(prefix + '/')
  );
}

/**
 * Generates a cryptographically secure CSRF token (64 hex chars).
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip safe HTTP methods
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Skip exempt paths — matched against the full URL because at global middleware scope
  // req.path is always the root segment; req.originalUrl holds the complete path.
  if (isExemptPath(req.originalUrl)) {
    return next();
  }

  // req.headers values can be string | string[] | undefined; normalize to a plain string
  const rawHeader = req.headers[CSRF_HEADER_NAME];
  const headerToken: string | undefined = Array.isArray(rawHeader)
    ? rawHeader[0]
    : rawHeader;
  const cookieToken: string | undefined = req.cookies?.[CSRF_COOKIE_NAME] as
    | string
    | undefined;

  if (!headerToken || !cookieToken) {
    res.status(403).json({
      success: false,
      message: 'CSRF token is required. Please refresh and try again.',
      error: {
        errorCode: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required. Please refresh and try again.',
      },
    });
    return;
  }

  // Constant-time comparison to prevent timing attacks.
  // Both are guaranteed strings here (narrowed above).
  const headerBuf = Buffer.from(headerToken as string);
  const cookieBuf = Buffer.from(cookieToken as string);

  const tokensMatch =
    headerBuf.length === cookieBuf.length &&
    crypto.timingSafeEqual(headerBuf, cookieBuf);

  if (!tokensMatch) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh and try again.',
      error: {
        errorCode: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token. Please refresh and try again.',
      },
    });
    return;
  }

  next();
}
