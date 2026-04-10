import { GetReviewRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { z, ZodType } from 'zod';

export const getReviewSchema: ZodType<GetReviewRequest> = z.object({
  reviewId: z.string().uuid(),
});

export type GetReviewByEnrollmentDto = z.infer<typeof getReviewSchema>;
