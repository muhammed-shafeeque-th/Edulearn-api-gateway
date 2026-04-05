import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const getUserWalletSchema = z.object({
  userId: z.string().uuid(),
  pagination: paginationSchema.default({
    page: 1,
    pageSize: 10,
  }),
});

export type GetUserWalletDto = z.infer<typeof getUserWalletSchema>;
