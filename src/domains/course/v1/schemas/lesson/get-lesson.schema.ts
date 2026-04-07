import { GetLessonRequest } from '@/domains/service-clients/course/proto/generated/course/types/lesson';
import { z, ZodType } from 'zod';

export const getLessonSchema: ZodType<GetLessonRequest> = z.object({
  lessonId: z.string().uuid(),
});

export type GetLessonDto = z.infer<typeof getLessonSchema>;
