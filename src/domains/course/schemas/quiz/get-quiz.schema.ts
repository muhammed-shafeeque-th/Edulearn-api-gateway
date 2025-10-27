import { GetQuizRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';


export const getQuizSchema: ZodType<GetQuizRequest> = z.object({
  quizId: z.string(),
});

export type CreateQuizDto = z.infer<typeof getQuizSchema>;
