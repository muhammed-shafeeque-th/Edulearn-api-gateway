import { AuthUserInfo } from '@/domains/service-clients/auth/proto/generated/auth_service';

export interface IUser {
  id: string;
  email: string;
  role: UserRoles;
  firstName?: string;
  lastName?: string;
  password?: string;
  status: UserStatus;
  avatar?: string;
  authType?: AuthType;
  phone?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface IAuthTokens {
  refreshToken: string;
  accessToken: string;
}

export enum UserStatus {
  VERIFIED = 'verified',
  NOT_VERIFIED = 'not-verified',
  ACTIVE = 'active',
  NOT_ACTIVE = 'not-active',
  BLOCKED = 'blocked',
}

export enum UserRoles {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

export enum AuthType {
  EMAIL = 'email',
  OAUTH = 'oauth',
}

export interface IUserWithAuthToken extends IAuthTokens {
  user: AuthUserInfo;
}

export type USER_ROLE = 'admin' | 'instructor' | 'student';
