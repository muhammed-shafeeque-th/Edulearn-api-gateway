import { GetLessonsBySectionRequest } from '@/domains/service-clients/course/proto/generated/course/types/lesson';
import { z, ZodType } from 'zod';

export const getLessonsBySectionSchema: ZodType<GetLessonsBySectionRequest> =
  z.object({
    sectionId: z.string().uuid(),
  });

export type GetLessonsBySectionDto = z.infer<typeof getLessonsBySectionSchema>;
