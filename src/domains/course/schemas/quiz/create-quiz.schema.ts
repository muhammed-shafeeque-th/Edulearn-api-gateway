import { CreateQuizRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const createQuizSchema: ZodType<CreateQuizRequest> = z.object({
  courseId: z.string(),
  sectionId : z.string(),
  userId: z.string().uuid(),
  maxAttempts: z.number(),
  passingScore: z.number(),
  isRequired: z.boolean(),
  title: z.string(),
  timeLimit: z.number(),
  description: z.string().optional(),
  questions: z.array(z.any()),
});

export type CreateQuizDto = z.infer<typeof createQuizSchema>;
