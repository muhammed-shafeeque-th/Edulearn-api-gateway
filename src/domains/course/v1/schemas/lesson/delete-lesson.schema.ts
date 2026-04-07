import { DeleteLessonRequest } from '@/domains/service-clients/course/proto/generated/course/types/lesson';
import { z, ZodType } from 'zod';

export const deleteLessonSchema: ZodType<DeleteLessonRequest> = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeleteLessonDto = z.infer<typeof deleteLessonSchema>;
