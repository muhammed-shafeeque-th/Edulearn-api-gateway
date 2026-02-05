import { CheckEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/enrollment';
import { z, ZodType } from 'zod';

export const checkEnrollmentSchema: ZodType<CheckEnrollmentRequest> = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type CheckEnrollmentDto = z.infer<typeof checkEnrollmentSchema>;
