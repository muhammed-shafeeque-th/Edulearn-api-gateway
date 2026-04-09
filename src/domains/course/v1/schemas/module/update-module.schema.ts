import { UpdateModuleRequest } from '@/domains/service-clients/course/proto/generated/course/types/module';
import { z, ZodType } from 'zod';

export const updateModuleSchema: ZodType<UpdateModuleRequest> = z.object({
  moduleId: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  description: z.string(),
  isPublished: z.boolean(),
  order: z.number(),
  title: z.string(),
});

export type UpdateModuleDto = z.infer<typeof updateModuleSchema>;
