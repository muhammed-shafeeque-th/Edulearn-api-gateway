import { GetCoursesRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';
import { courseFiltersSchema } from '../course-filter.schema';

export const getCoursesSchema: ZodType<GetCoursesRequest> = z.object({
  params: z.object({
    pagination: paginationSchema.default({
      pageSize: 10,
      page: 1,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
    }),
    filters: courseFiltersSchema.default({
      search: '',
      category: [],
      level: [],
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
    }),
  }),
}) as ZodType<GetCoursesRequest>;

export type GetCourseDto = z.infer<typeof getCoursesSchema>;
