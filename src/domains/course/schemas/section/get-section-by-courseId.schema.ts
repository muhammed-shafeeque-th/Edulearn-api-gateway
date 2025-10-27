import { CreateSectionRequest, GetSectionRequest, GetSectionsByCourseRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';


export const getSectionsByCourseSchema: ZodType<GetSectionsByCourseRequest> = z.object({
  courseId: z.string(),
});

export type GetSectionsByCourseDto = z.infer<typeof getSectionsByCourseSchema>;
