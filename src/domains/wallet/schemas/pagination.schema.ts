import { z } from 'zod';

// Use numbers for schema, default values should be numbers for clarity
export const paginationSchema = z.object({
  page: z
    .preprocess((val) => {
      // Accept string or number, return as number, fallback to 1
      if (typeof val === 'string' && val.trim() !== '') return Number(val);
      if (typeof val === 'number') return val;
      return 1;
    }, z.number().min(1).default(1)),
  pageSize: z
    .preprocess((val) => {
      // Accept string or number, return as number, fallback to 10
      if (typeof val === 'string' && val.trim() !== '') return Number(val);
      if (typeof val === 'number') return val;
      return 10;
    }, z.number().min(1).default(10)),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
