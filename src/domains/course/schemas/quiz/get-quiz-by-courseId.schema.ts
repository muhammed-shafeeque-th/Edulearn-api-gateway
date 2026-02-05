import { GetQuizzesByCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/quiz';
import { z, ZodType } from 'zod';

export const getQuizzesByCourseSchema: ZodType<GetQuizzesByCourseRequest> =
  z.object({
    courseId: z.string().uuid(),
  });

export type GetQuizzesByCourseDto = z.infer<typeof getQuizzesByCourseSchema>;
