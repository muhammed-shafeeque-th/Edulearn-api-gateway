import { GetModuleRequest } from '@/domains/service-clients/course/proto/generated/course/types/module';
import { z, ZodType } from 'zod';

export const getModuleSchema: ZodType<GetModuleRequest> = z.object({
  moduleId: z.string().uuid(),
});

export type CreateModuleDto = z.infer<typeof getModuleSchema>;
