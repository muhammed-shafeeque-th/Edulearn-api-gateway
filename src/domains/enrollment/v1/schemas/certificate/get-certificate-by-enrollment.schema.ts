import { GetCertificateByEnrollmentRequest } from '@/domains/service-clients/course/proto/generated/course/types/certificate';
import { z, ZodType } from 'zod';

export const getCertificateByEnrollmentSchema: ZodType<GetCertificateByEnrollmentRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
    userId: z.string().uuid(),
  });

export type GetCertificateByEnrollmentDto = z.infer<
  typeof getCertificateByEnrollmentSchema
>;
