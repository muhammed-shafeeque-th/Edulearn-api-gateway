import { ToggleCartItemRequest } from '@/domains/service-clients/user/proto/generated/user/types/cart_types';
import { z, ZodType } from 'zod';

export const toggleCartItemSchema: ZodType<ToggleCartItemRequest> = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
});

export type ToggleCartItemType = z.infer<typeof toggleCartItemSchema>;
