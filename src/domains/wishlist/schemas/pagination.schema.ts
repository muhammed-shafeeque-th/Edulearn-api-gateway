import { z, ZodType } from 'zod';

export const paginationSchema = z.object({
  pageSize: z.number().default(10),
  page: z.number().default(0),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
