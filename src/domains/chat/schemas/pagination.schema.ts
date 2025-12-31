import { PaginationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const paginationSchema: ZodType<PaginationRequest> = z.object({
  pageSize: z
    .string()
    .default('10')
    .transform(str => Number(str)),
  page: z
    .string()
    .default('0')
    .transform(str => Number(str)),
}) as unknown as ZodType<PaginationRequest>;

export type PaginationDto = z.infer<typeof paginationSchema>;
