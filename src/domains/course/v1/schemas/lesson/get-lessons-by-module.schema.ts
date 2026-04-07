import { GetLessonsByModuleRequest } from '@/domains/service-clients/course/proto/generated/course/types/lesson';
import { z, ZodType } from 'zod';

export const getLessonsByModuleSchema: ZodType<GetLessonsByModuleRequest> =
  z.object({
    moduleId: z.string().uuid(),
  });

export type GetLessonsByModuleDto = z.infer<typeof getLessonsByModuleSchema>;
