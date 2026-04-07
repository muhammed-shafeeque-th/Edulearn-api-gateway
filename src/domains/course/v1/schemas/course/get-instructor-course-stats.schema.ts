import { GetCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';

export const getInstructorCourseStatsSchema = z.object({
  instructorId: z.string().uuid(),
});

export type GetCourseDto = z.infer<typeof getInstructorCourseStatsSchema>;
