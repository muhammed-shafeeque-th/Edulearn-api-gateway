import { PaginationRequest } from '@/domains/service-clients/user/proto/generated/user/common';
import { z, ZodType } from 'zod';

export const paginationSchema: ZodType<PaginationRequest> = z.object({
  page: z
    .string()
    .default('1')
    .transform(str => Number(str)),
  pageSize: z
    .string()
    .default('10')
    .transform(str => Number(str)),
}) as unknown as ZodType<PaginationRequest>;

export type PaginationSchemaType = z.infer<typeof paginationSchema>;
