import { UserInfo } from "@/domains/user/v1/types";

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
  VERIFIED = "verified",
  NOT_VERIFIED = "not-verified",
  ACTIVE = "active",
  NOT_ACTIVE = "not-active",
  BLOCKED = "blocked",
}

export enum UserRoles {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  USER = "user",
}

export enum AuthType {
  EMAIL = "email",
  OAUTH_2 = "oauth-2",
}

