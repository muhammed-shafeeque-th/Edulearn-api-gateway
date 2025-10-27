import { z } from 'zod';



export const removeFromWishlistSchema = z.object({
  courseId: z.string(),
  wishlistId: z.string(),
});

export type DeleteQuizDto = z.infer<typeof removeFromWishlistSchema>