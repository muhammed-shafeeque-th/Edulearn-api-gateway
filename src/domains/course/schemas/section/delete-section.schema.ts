import { DeleteSectionRequest } from '@/domains/service-clients/course/proto/generated/course/types/section';
import { z, ZodType } from 'zod';

export const deleteSectionSchema: ZodType<DeleteSectionRequest> = z.object({
  sectionId: z.string().uuid(),
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeleteSectionDto = z.infer<typeof deleteSectionSchema>;
