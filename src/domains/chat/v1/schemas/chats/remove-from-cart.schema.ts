import { z } from 'zod';

export const removeFromCartSchema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeleteQuizDto = z.infer<typeof removeFromCartSchema>;
