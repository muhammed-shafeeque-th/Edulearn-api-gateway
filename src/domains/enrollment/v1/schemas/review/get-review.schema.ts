import { GetReviewByEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { z, ZodType } from 'zod';

export const getReviewByEnrollmentSchema: ZodType<GetReviewByEnrollmentRequest> = z.object({
  userId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
});

export type GetReviewByEnrollmentDto = z.infer<typeof getReviewByEnrollmentSchema>;
