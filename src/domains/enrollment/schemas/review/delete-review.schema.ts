import { DeleteReviewRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { z, ZodType } from 'zod';

export const deleteReviewSchema: ZodType<DeleteReviewRequest> = z.object({
  reviewId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeleteReviewDto = z.infer<typeof deleteReviewSchema>;
