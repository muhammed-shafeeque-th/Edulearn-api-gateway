import { DeleteQuizRequest } from '@/domains/service-clients/course/proto/generated/course/types/quiz';
import { z, ZodType } from 'zod';

export const deleteQuizSchema: ZodType<DeleteQuizRequest> = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  quizId: z.string().uuid(),
});

export type DeleteQuizDto = z.infer<typeof deleteQuizSchema>;
