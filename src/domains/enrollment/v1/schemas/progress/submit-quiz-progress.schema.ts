import { SubmitQuizAttemptRequest } from '@/domains/service-clients/course/proto/generated/course/types/progress';
import { z, ZodType } from 'zod';

export const submitQuizProgressSchema: ZodType<SubmitQuizAttemptRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
    userId: z.string().uuid(),
    quizId: z.string().uuid(),
    answers: z.array(
      z.object({ questionId: z.string().uuid(), answers: z.array(z.string()) })
    ),
    timeSpent: z.number(),
  });

export type SubmitQuizProgressDto = z.infer<typeof submitQuizProgressSchema>;
