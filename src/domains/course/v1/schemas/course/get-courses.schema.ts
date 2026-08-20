import { GetCoursesRequest } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';
import { courseFiltersSchema } from '../course-filter.schema';

const defaultPagination = {
  pageSize: 10,
  page: 1,
  sortBy: 'updatedAt',
  sortOrder: 'DESC',
};

const defaultFilters = {
  search: '',
  category: [],
  level: [],
  minPrice: undefined,
  maxPrice: undefined,
  rating: undefined,
};

export const getCoursesSchema: ZodType<GetCoursesRequest> = z.object({
  params: z.object({
    pagination: paginationSchema.default(defaultPagination),
    filters: courseFiltersSchema.default(defaultFilters),
  }).default({
    pagination: defaultPagination,
    filters: defaultFilters,
  }),
}).default({
  params: {
    pagination: defaultPagination,
    filters: defaultFilters,
  },
}) as ZodType<GetCoursesRequest>;

export type GetCourseDto = z.infer<typeof getCoursesSchema>;
