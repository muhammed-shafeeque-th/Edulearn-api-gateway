import { DownloadCertificateRequest } from '@/domains/service-clients/course/proto/generated/course/types/certificate';
import { z, ZodType } from 'zod';

export const downloadCertificateSchema: ZodType<DownloadCertificateRequest> =
  z.object({
    userId: z.string().uuid(),
    certificateId: z.string().uuid(),
  });

export type DownloadCertificateSchemaType = z.infer<
  typeof downloadCertificateSchema
>;
