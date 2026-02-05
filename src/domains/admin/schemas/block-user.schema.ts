import { z } from 'zod';

export const blockUserSchema = z.object({
  userId: z.string().uuid(),
});

export type BlockUserType = z.infer<typeof blockUserSchema>;
