import { Pagination } from '@/domains/service-clients/course/proto/generated/course/common';
import { z, ZodType } from 'zod';

export const paginationSchema: ZodType<Pagination> = z.object({
  pageSize: z.preprocess(
    val => (typeof val === 'string' ? Number(val) : val),
    z.number().min(1, 'PageSize limit must be at least one')
  ),
  page: z.preprocess(
    val => (typeof val === 'string' ? Number(val) : val),
    z.number().min(1, 'PageSize limit must be at least one')
  ),
  sortBy: z.string().optional(),
  sortOrder: z
    .enum(['ASC', 'DESC'], {
      required_error: 'Sort order is required',
      invalid_type_error: 'Sort order must be either ASC or DESC',
      description: 'Sort order, can be ASC or DESC',
    })
    .optional(),
}) as ZodType<Pagination>;

export type PaginationDto = z.infer<typeof paginationSchema>;
