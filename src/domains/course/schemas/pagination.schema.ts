import { Pagination } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const paginationSchema: ZodType<Pagination> = z.object({
  pageSize: z.number().min(1, 'Page limit must be at least one'),
  page: z.number().min(1, 'Page number must be at least one'),
  sortBy: z.string().optional(),
  sortOrder: z
    .enum(['ASC', 'DESC'], {
      required_error: 'Sort order is required',
      invalid_type_error: 'Sort order must be either ASC or DESC',
      description: 'Sort order, can be ASC or DESC',
    })
    .optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
