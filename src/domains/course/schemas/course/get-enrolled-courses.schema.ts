import { GetEnrolledCoursesRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';

export const getEnrolledCoursesSchema: ZodType<GetEnrolledCoursesRequest> =
  z.object({
    userId: z.string().uuid(),
    pagination: paginationSchema.default({
      page: 1,
      pageSize: 10,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
    }),
  }) as ZodType<GetEnrolledCoursesRequest>;

export type GetCourseDto = z.infer<typeof getEnrolledCoursesSchema>;
