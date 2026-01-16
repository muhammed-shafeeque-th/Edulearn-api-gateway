import { z } from 'zod';
import { paginationSchema } from './pagination.schema';

export const getWalletTransactionsSchema = z.object({
  userId: z.string().uuid(),
  pagination: paginationSchema
});

export type GetUserWalletDto = z.infer<typeof getWalletTransactionsSchema>;
