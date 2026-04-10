import { UpdateLessonProgressRequest } from '@/domains/service-clients/course/proto/generated/course/types/progress';
import { z, ZodType } from 'zod';

export const updateLessonProgressSchema: ZodType<UpdateLessonProgressRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
    userId: z.string().uuid(),
    lessonId: z.string().uuid(),
    currentTime: z.number(),
    duration: z.number(),
    event: z.string(),
  });

export type CreateLessonProgressDto = z.infer<
  typeof updateLessonProgressSchema
>;
