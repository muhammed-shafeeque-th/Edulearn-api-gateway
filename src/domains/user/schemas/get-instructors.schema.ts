import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';
import { GetInstructorsRequest } from '@/domains/service-clients/user/proto/generated/user/types/instructor_types';

export const getInstructorsSchema: ZodType<GetInstructorsRequest> = z.object({
  pagination: paginationSchema
});

export type GetInstructorsType = z.infer<typeof getInstructorsSchema>;
