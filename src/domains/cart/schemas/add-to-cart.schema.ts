import { AddToCartRequest } from '@/domains/service-clients/user/proto/generated/user_service';
import { z, ZodType } from 'zod';

export const addToCartSchema: ZodType<AddToCartRequest> = z.object({
  userId: z.string(),
  cartId: z.string(),
  courseId: z.string(),
});

export type UpdateQuizDto = z.infer<typeof addToCartSchema>;
