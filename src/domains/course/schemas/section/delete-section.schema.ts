import {  DeleteSectionRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';



export const deleteSectionSchema: ZodType<DeleteSectionRequest> = z.object({
  sectionId: z.string(),
  courseId: z.string(),
  userId: z.string(),
});

export type DeleteSectionDto = z.infer<typeof deleteSectionSchema>