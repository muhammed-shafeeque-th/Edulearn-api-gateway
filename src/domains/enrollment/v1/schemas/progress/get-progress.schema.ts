import { GetProgressRequest } from '@/domains/service-clients/course/proto/generated/course/types/progress';
import { z, ZodType } from 'zod';

export const getProgressSchema: ZodType<GetProgressRequest> = z.object({
  progressId: z.string().uuid(),
});

export type GetProgressDto = z.infer<typeof getProgressSchema>;
