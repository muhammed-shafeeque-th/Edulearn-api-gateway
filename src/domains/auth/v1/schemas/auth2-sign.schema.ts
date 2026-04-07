import { Auth2SignRequest } from '@/domains/service-clients/auth/proto/generated/auth_service';
import { z, ZodType } from 'zod';
import { AuthType } from '../types';

export const Auth2SignSchema: ZodType<Auth2SignRequest> = z.object({
  provider: z.string(),
  token: z.string(),
  authType: z.enum(Object.values(AuthType) as [string], {
    message: 'Invalid authType. AuthType must be one of the defined types',
  }),
});

export type Auth2SignDto = z.infer<typeof Auth2SignSchema>;
