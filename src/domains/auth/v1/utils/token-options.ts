import { config } from '@/config';
import { ITokenOptions } from '@/services/auth-token';
import { decode } from 'jsonwebtoken';

export const getAccessTokenOptions = (token?: string): ITokenOptions => {
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
    path: '/',
  } as ITokenOptions;

  return cookie;
};

export const getRefreshTokenOptions = (token?: string): ITokenOptions => {
  let expiresAtDate, maxAge;
  if (token) {
    const jwtPayload: any = decode(token);
    expiresAtDate = new Date(jwtPayload.exp * 1000);
    maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
  }

  const cookie: ITokenOptions = {
    expires: expiresAtDate,
    httpOnly: true || config.nodeEnv === 'production',
    maxAge: maxAge,
    sameSite: 'none',
    secure: true,
    // path: '/api/v1/auth',
    path: '/',
  };

  return cookie;
};
