import { GetCertificateRequest } from '@/domains/service-clients/course/proto/generated/course/types/certificate';
import { z, ZodType } from 'zod';

export const getCertificateSchema: ZodType<GetCertificateRequest> =
  z.object({
    certificateId: z.string().uuid(),
    userId: z.string().uuid(),
  });

export type GetCertificateDto = z.infer<
  typeof getCertificateSchema
>;
