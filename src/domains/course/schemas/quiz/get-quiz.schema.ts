import { GetQuizRequest } from '@/domains/service-clients/course/proto/generated/course/types/quiz';
import { z, ZodType } from 'zod';

export const getQuizSchema: ZodType<GetQuizRequest> = z.object({
  quizId: z.string().uuid(),
});

export type CreateQuizDto = z.infer<typeof getQuizSchema>;
