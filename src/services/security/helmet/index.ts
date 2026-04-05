import { RequestHandler } from 'express';
import helmet from 'helmet';

export const helmetSecurity: RequestHandler = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // 'unsafe-inline' removed — use a nonce/hash strategy for inline scripts instead
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  // HTTP Strict-Transport-Security: enforce HTTPS for 1 year across all subdomains
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  // Enable cross-origin embedder policy for better isolation
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'no-referrer' },
  frameguard: { action: 'deny' },
  // Blocks Flash/PDF cross-domain access
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  hidePoweredBy: true,
});
