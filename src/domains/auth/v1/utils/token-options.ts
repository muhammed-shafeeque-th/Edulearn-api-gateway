import { config } from '@/config';
import { ITokenOptions } from '@/services/auth-token';
import { decode } from 'jsonwebtoken';

export const baseTokenOptions = (token?: string): ITokenOptions => {
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

export const getRefreshTokenOptions = (token?: string): ITokenOptions => {
  return {
    ...baseTokenOptions(token),
    // Optional: /api/v1/auth/refresh
    path: '/',
  };
};

export const getAccessTokenOptions = (token?: string): ITokenOptions => {
  return baseTokenOptions(token);
};
export const getCsrfTokenOptions = (): ITokenOptions => {
  return {
    /**
     * JS must be able to read this cookie
     */
    httpOnly: false,

    // Required for __Secure- cookies.
    secure: true,
    domain: config.appBaseDomain,
    path: '/',

    // app.edulearn.com -> api.edulearn.com  is same-site.
    sameSite: 'lax',
  };
};
