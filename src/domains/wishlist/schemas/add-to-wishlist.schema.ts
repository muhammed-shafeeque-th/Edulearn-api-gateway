import { AddToWishlistRequest } from '@/domains/service-clients/user/proto/generated/user_service';
import { z, ZodType } from 'zod';

export const addToWishlistSchema: ZodType<AddToWishlistRequest> = z.object({
  userId: z.string(),
  wishlistId: z.string(),
  courseId: z.string(),
});

export type UpdateQuizDto = z.infer<typeof addToWishlistSchema>;
