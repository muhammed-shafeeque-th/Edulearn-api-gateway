import { DeleteProgressRequest } from '@/domains/service-clients/course/proto/generated/course/types/progress';
import { z, ZodType } from 'zod';

export const deleteProgressSchema: ZodType<DeleteProgressRequest> = z.object({
  progressId: z.string().uuid(),
});

export type DeleteProgressDto = z.infer<typeof deleteProgressSchema>;
