import { AddToWishlistRequest, ToggleWishlistItemRequest } from '@/domains/service-clients/user/proto/generated/user_service';
import { z, ZodType } from 'zod';

export const toggleWishlistItemSchema: ZodType<ToggleWishlistItemRequest> = z.object({
  userId: z.string(),
  wishlistId: z.string(),
  courseId: z.string(),
});

export type UpdateQuizDto = z.infer<typeof toggleWishlistItemSchema>;
