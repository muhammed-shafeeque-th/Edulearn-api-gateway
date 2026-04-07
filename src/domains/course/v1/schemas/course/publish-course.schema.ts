import { PublishCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';

export const publishCourseSchema: ZodType<PublishCourseRequest> = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  isAdmin: z.boolean(),
});

export type PublishCourseDto = z.infer<typeof publishCourseSchema>;
