import { ITokenOptions } from '@/shared/types';
import { config } from '../../../../config';
import { decode } from 'jsonwebtoken';

export const getAdminAccessTokenOptions = (token?: string): ITokenOptions => {
  let expiresAtDate, maxAge;
  if (token) {
    const jwtPayload: any = decode(token);
    expiresAtDate = new Date(jwtPayload.exp * 1000);
    maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
  }

  const isProduction = config.nodeEnv === 'production';

  const cookie = {
    expires: expiresAtDate,
    httpOnly: true,
    maxAge: maxAge,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  } as ITokenOptions;

  return cookie;
};

export const getAdminRefreshTokenOptions = (token?: string): ITokenOptions => {
  let expiresAtDate, maxAge;
  if (token) {
    const jwtPayload: any = decode(token);
    expiresAtDate = new Date(jwtPayload.exp * 1000);
    maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
  }

  const isProduction = config.nodeEnv === 'production';

  const cookie: ITokenOptions = {
    expires: expiresAtDate,
    httpOnly: true,
    maxAge: maxAge,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    // path: '/api/v1/auth',
    path: '/',
  };

  return cookie;
};
