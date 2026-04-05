import jwt from 'jsonwebtoken';
import { LoggingService } from '@/services/observability/logging/logging.service';

const logger = LoggingService.getInstance();

export interface PlaybackTokenPayload {
  sub: string; // userId
  enrollmentId: string;
  courseId: string;
  lessonId: string;
  sessionId: string; // logical playback session
  deviceId?: string; // optional per-device binding
}

interface IssueOptions {
  ttlSeconds?: number;
}

export interface PlaybackTokenResult {
  token: string;
  expiresAt: number; // epoch ms
}

export class PlaybackTokenService {
  private readonly secret: string;
  private readonly defaultTtlSeconds = 60 * 60; // 60 min

  constructor(secret?: string) {
    this.secret = secret || process.env.PLAYBACK_TOKEN_SECRET!;
    if (!this.secret) {
      throw new Error('PLAYBACK_TOKEN_SECRET is not configured');
    }
  }

  issueToken(
    payload: PlaybackTokenPayload,
    options: IssueOptions = {}
  ): PlaybackTokenResult {
    const ttl = options.ttlSeconds ?? this.defaultTtlSeconds;
    const nowSeconds = Math.floor(Date.now() / 1000);

    const token = jwt.sign(
      {
        sub: payload.sub,
        enrollmentId: payload.enrollmentId,
        courseId: payload.courseId,
        lessonId: payload.lessonId,
        sessionId: payload.sessionId,
        deviceId: payload.deviceId,
        iat: nowSeconds,
      },
      this.secret,
      {
        expiresIn: ttl,
      }
    );

    const expiresAt = (nowSeconds + ttl) * 1000;

    return { token, expiresAt };
  }

  verifyToken(
    token: string
  ): PlaybackTokenPayload & { exp: number; iat: number } {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      return decoded;
    } catch (error: any) {
      logger.warn('Playback token verification failed', {
        error: error.message,
      });
      throw new Error('Invalid or expired playback token');
    }
  }
}
