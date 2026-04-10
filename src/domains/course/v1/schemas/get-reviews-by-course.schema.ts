import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';
import { GetReviewsByCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';

export const getReviewsByCourseSchema: ZodType<GetReviewsByCourseRequest> = z.object({
    pagination: paginationSchema.default({
      pageSize: 10,
      page: 1,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
    }),
    courseId: z.string().uuid(),
}) as ZodType<GetReviewsByCourseRequest>;

export type GetCourseDto = z.infer<typeof getReviewsByCourseSchema>;
