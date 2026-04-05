import { USER_ROLE } from "@/domains/auth/v1/types";

export {};



declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      authToken?: string;
      user?: {
        userId: string;
        roles: USER_ROLE[];
        email: string;
        username: string;
        avatar?: string;
        sessionId?: string;
        deviceId?: string;
        permissions?: string[]
      };
    }
  }
}
