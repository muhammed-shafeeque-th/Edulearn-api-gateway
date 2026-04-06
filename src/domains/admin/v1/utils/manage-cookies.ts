import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { adminRefreshToken, adminToken } from './constants';
import { getAdminAccessTokenOptions, getAdminRefreshTokenOptions } from './token-options';
import { Response } from 'express';
import { ITokenOptions } from '@/shared/types';

export function attachAdminCookies<TResponse extends Response>(
  res: TResponse | ResponseWrapper,
  refreshToken: string,
  accessToken: string
): void {
  res.cookie(
    adminRefreshToken,
    refreshToken,
    getAdminRefreshTokenOptions(refreshToken) as ITokenOptions
  );
  res.cookie(
    adminToken,
    accessToken,
    getAdminAccessTokenOptions(accessToken) as ITokenOptions
  );
}

export function clearAdminCookies<TResponse extends Response>(
  res: TResponse | ResponseWrapper
): void {
  res.clearCookie(adminRefreshToken, getAdminRefreshTokenOptions() as ITokenOptions);
  res.clearCookie(adminToken, getAdminAccessTokenOptions() as ITokenOptions);
}
