import { GetCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';

export const getCourseSchema: ZodType<GetCourseRequest> = z.object({
  courseId: z.string().uuid(),
});

export type GetCourseDto = z.infer<typeof getCourseSchema>;
