import { AddToCartRequest } from '@/domains/service-clients/user/proto/generated/user/types/cart_types';
import { z, ZodType } from 'zod';

export const addToCartSchema: ZodType<AddToCartRequest> = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
});

export type UpdateQuizDto = z.infer<typeof addToCartSchema>;
