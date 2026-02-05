import { z } from 'zod';

export const detailedUserSchema = z.object({
  userId: z
    .string({ message: 'userId be string type' })
    .uuid(),
});

export type DetailedUserType = z.infer<typeof detailedUserSchema>;
