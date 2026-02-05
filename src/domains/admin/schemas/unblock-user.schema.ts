import { z } from 'zod';

export const unBlockUserSchema = z.object({
  userId: z.string().uuid().uuid({ message: '`userId` must be type of UUID' }),
});

export type UnBlockUserType = z.infer<typeof unBlockUserSchema>;
