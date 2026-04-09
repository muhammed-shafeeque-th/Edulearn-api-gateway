import { DeleteModuleRequest } from '@/domains/service-clients/course/proto/generated/course/types/module';
import { z, ZodType } from 'zod';

export const deleteModuleSchema: ZodType<DeleteModuleRequest> = z.object({
  moduleId: z.string().uuid(),
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeleteModuleDto = z.infer<typeof deleteModuleSchema>;
