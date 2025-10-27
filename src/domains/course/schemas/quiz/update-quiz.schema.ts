import { UpdateQuizRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const updateQuizSchema: ZodType<UpdateQuizRequest> = z.object({
  quizId: z.string(),
  courseId: z.string(),
  userId: z.string().uuid(),
  maxAttempts: z.number(),
  passingScore: z.number(),
  isRequired: z.boolean(),
  title: z.string(),
  timeLimit: z.number(),
  description: z.string(),
  questions: z.array(z.any()),
  
});

export type UpdateQuizDto = z.infer<typeof updateQuizSchema>;
