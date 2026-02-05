import { DeleteEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/enrollment';
import { z, ZodType } from 'zod';

export const deleteEnrollmentSchema: ZodType<DeleteEnrollmentRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
  });

export type DeleteEnrollmentDto = z.infer<typeof deleteEnrollmentSchema>;
