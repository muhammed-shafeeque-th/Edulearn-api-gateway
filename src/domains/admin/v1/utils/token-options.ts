import { ITokenOptions } from '@/services/auth-token';
import { config } from '../../../../config';
import { decode } from 'jsonwebtoken';

const baseTokenOptions = (token?: string): ITokenOptions => {
  let expiresAtDate, maxAge;
  if (token) {
    const jwtPayload: any = decode(token);
    expiresAtDate = new Date(jwtPayload.exp * 1000);
    maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
  }

  const cookie = {
    expires: expiresAtDate,
    httpOnly: true || config.nodeEnv === 'production',
    maxAge: maxAge,
    sameSite: 'none',
    secure: true,
    domain: config.appBaseDomain,
    path: '/',
  } as ITokenOptions;

  return cookie;
};

export const getAdminAccessTokenOptions = (token?: string): ITokenOptions => {
  return baseTokenOptions(token);
};

export const getAdminRefreshTokenOptions = (token?: string): ITokenOptions => {
  return {
    ...baseTokenOptions(token),
    // Optional: /api/v1/auth/refresh
    path: '/',
  };
};
