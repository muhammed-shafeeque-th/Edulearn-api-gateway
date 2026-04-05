import { z } from 'zod';

export const currentUserSchema = z.object({
  userId: z
    .string({ message: 'userId be string type' })
    .uuid(),
});

export type CurrentUserType = z.infer<typeof currentUserSchema>;
