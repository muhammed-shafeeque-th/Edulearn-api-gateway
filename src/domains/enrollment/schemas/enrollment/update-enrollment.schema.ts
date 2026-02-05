import { UpdateEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/enrollment';
import { z, ZodType } from 'zod';

export const updateEnrollmentSchema: ZodType<UpdateEnrollmentRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
    status: z.string(),
  });

export type CreateEnrollmentDto = z.infer<typeof updateEnrollmentSchema>;
