import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';


export const getUserCartSchema= z.object({
  userId: z.string(),
  pagination: paginationSchema.default({
    page: 1,
    pageSize: 10,
  
  })
});

export type CreateQuizDto = z.infer<typeof getUserCartSchema>;
