import { UpdateSectionRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';



export const updateSectionSchema: ZodType<UpdateSectionRequest> = z.object({
  sectionId: z.string(),
  userId: z.string(),
  courseId: z.string(),
  description: z.string(),
  isPublished: z.boolean(),
  order: z.number(),
  title: z.string(),

});

export type UpdateSectionDto = z.infer<typeof updateSectionSchema>