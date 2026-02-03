import { DeleteCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';

export const deleteCourseSchema: ZodType<DeleteCourseRequest> = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  isAdmin: z.boolean(),
});

export type GetCourseBySlugDto = z.infer<typeof deleteCourseSchema>;
