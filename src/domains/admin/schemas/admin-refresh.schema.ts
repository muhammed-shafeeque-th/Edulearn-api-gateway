import {  AdminRefreshRequest } from '@/domains/service-clients/auth/proto/generated/auth_service';
import { z, ZodType } from 'zod';

export const adminRefreshSchema: ZodType<AdminRefreshRequest> = z.object({
  refreshToken: z.string(),
});

export type AdminRefreshSchemaType = z.infer<typeof adminRefreshSchema>;
