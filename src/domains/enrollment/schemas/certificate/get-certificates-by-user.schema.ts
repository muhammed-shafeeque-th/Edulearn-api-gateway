import { GetCertificatesByUserRequest } from '@/domains/service-clients/course/proto/generated/course/types/certificate';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';

export const getCertificatesByUserSchema: ZodType<GetCertificatesByUserRequest> =
  z.object({
    userId: z.string().uuid(),
    pagination: paginationSchema,
  });

export type GetCertificatesByUserSchemaType = z.infer<
  typeof getCertificatesByUserSchema
>;
