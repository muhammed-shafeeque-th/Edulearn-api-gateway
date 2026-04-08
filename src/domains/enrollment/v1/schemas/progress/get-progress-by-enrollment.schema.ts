import { GetProgressByEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/progress';
import { z, ZodType } from 'zod';

export const getProgressByEnrollmentSchema: ZodType<GetProgressByEnrollmentRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
    userId: z.string().uuid(),
  });

export type GetProgressByEnrollmentDto = z.infer<
  typeof getProgressByEnrollmentSchema
>;
