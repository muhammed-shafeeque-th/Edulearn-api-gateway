import { GenerateCertificateRequest } from '@/domains/service-clients/course/proto/generated/course/types/certificate';
import { z, ZodType } from 'zod';

export const generateCertificateSchema: ZodType<GenerateCertificateRequest> =
  z.object({
    enrollmentId: z.string().uuid(),
    studentName: z.string(),
    userId: z.string().uuid(),
  });

export type GenerateCertificateDto = z.infer<typeof generateCertificateSchema>;
