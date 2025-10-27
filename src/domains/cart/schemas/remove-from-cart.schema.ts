import { z } from 'zod';



export const removeFromCartSchema = z.object({
  courseId: z.string(),
  cartId: z.string(),
});

export type DeleteQuizDto = z.infer<typeof removeFromCartSchema>