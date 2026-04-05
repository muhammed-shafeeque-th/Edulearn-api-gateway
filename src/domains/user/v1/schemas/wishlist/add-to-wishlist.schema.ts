import { AddToWishlistRequest } from '@/domains/service-clients/user/proto/generated/user/types/wishlist_types';
import { z, ZodType } from 'zod';

export const addToWishlistSchema: ZodType<AddToWishlistRequest> = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
});

export type UpdateQuizDto = z.infer<typeof addToWishlistSchema>;
