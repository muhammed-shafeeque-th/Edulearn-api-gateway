import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { authRefreshToken, authToken } from './constants';
import { getAccessTokenOptions, getRefreshTokenOptions } from './token-options';
import { Response } from 'express';
import { CSRF_COOKIE_NAME, ITokenOptions } from '@/services/auth-token';

export function attachCookies(
  res: ResponseWrapper | Response,
  refreshToken: string,
  accessToken: string
): void {
  res.cookie(
    authRefreshToken,
    refreshToken,
    getRefreshTokenOptions(refreshToken) as ITokenOptions
  );
  res.cookie(
    authToken,
    accessToken,
    getAccessTokenOptions(accessToken) as ITokenOptions
  );
}

export function clearCookies(res: ResponseWrapper | Response): void {
  res.clearCookie(authRefreshToken, getRefreshTokenOptions() as ITokenOptions);
  res.clearCookie(authToken, getAccessTokenOptions() as ITokenOptions);
  res.clearCookie(CSRF_COOKIE_NAME, {
    path: '/',
    secure: true,
    sameSite: 'none',
  } as ITokenOptions);
}
