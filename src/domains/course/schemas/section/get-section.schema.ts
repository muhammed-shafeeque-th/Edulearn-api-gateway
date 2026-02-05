import { GetSectionRequest } from '@/domains/service-clients/course/proto/generated/course/types/section';
import { z, ZodType } from 'zod';

export const getSectionSchema: ZodType<GetSectionRequest> = z.object({
  sectionId: z.string().uuid(),
});

export type CreateSectionDto = z.infer<typeof getSectionSchema>;
