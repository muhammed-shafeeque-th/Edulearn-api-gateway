import { GetEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/enrollment';
import { z, ZodType } from 'zod';

export const getEnrollmentSchema: ZodType<GetEnrollmentRequest> = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type GetEnrollmentDto = z.infer<typeof getEnrollmentSchema>;
