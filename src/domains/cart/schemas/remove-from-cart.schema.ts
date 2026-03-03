import { RemoveFromCartRequest } from '@/domains/service-clients/user/proto/generated/user/types/cart_types';
import { z, ZodType } from 'zod';

export const removeFromCartSchema: ZodType<RemoveFromCartRequest> = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeleteQuizDto = z.infer<typeof removeFromCartSchema>;
