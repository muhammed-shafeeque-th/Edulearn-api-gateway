import { UpdateReviewRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { z, ZodType } from 'zod';

export const updateReviewSchema: ZodType<UpdateReviewRequest> = z.object({
  reviewId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
  comment: z.string(),
  rating: z.number(),
});

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
