import { GetReviewsByCourseRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';

export const getReviewsByCourseSchema: ZodType<GetReviewsByCourseRequest> =
  z.object({
    courseId: z.string().uuid(),
    pagination: paginationSchema.default({
      page: 1,
      pageSize: 10,
      sortOrder: 'DESC',
    }),
  }) as ZodType<GetReviewsByCourseRequest>;

export type GetReviewsByCourseDto = z.infer<typeof getReviewsByCourseSchema>;
