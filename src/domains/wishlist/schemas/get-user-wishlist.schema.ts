import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const getUserWishlistSchema = z.object({
  userId: z.string(),
  pagination: paginationSchema.default({
    page: 1,
    pageSize: 10,
  }),
});

export type CreateQuizDto = z.infer<typeof getUserWishlistSchema>;
