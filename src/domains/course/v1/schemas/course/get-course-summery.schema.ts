import { GetCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';

export const getCourseSummerySchema = z.object({
  courseId: z.string().uuid(),
  instructorId: z.string().uuid(),
});

export type GetCourseDto = z.infer<typeof getCourseSummerySchema>;
