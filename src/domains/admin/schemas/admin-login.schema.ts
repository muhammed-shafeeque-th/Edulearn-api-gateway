import { AdminLoginRequest } from '@/domains/service-clients/auth/proto/generated/auth_service';
import { z, ZodType } from 'zod';

export const adminLoginSchema: ZodType<AdminLoginRequest> = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type AdminLoginSchemaType = z.infer<typeof adminLoginSchema>;
