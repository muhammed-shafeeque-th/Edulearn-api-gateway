import { User } from '@/domains/service-clients/course/proto/generated/course/common';
import { SubmitCourseReviewRequest } from '@/domains/service-clients/course/proto/generated/course/types/review';
import { z, ZodType } from 'zod';

export const userSchema: ZodType<User> = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().optional(),
  email: z.string().optional(),
});

export const submitReviewSchema: ZodType<SubmitCourseReviewRequest> = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number(),
  comment: z.string(),
  user: userSchema,
});

export type SubmitReviewSchemaType = z.infer<typeof submitReviewSchema>;
