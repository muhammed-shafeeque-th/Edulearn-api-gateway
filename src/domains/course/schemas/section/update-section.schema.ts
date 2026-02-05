import { UpdateSectionRequest } from '@/domains/service-clients/course/proto/generated/course/types/section';
import { z, ZodType } from 'zod';

export const updateSectionSchema: ZodType<UpdateSectionRequest> = z.object({
  sectionId: z.string().uuid(),
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  description: z.string(),
  isPublished: z.boolean(),
  order: z.number(),
  title: z.string(),
});

export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;
