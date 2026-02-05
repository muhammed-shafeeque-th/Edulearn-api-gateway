import {
  GetSectionsByCourseRequest,
} from '@/domains/service-clients/course/proto/generated/course/types/section';
import { z, ZodType } from 'zod';

export const getSectionsByCourseSchema: ZodType<GetSectionsByCourseRequest> =
  z.object({
    courseId: z.string().uuid(),
  });

export type GetSectionsByCourseDto = z.infer<typeof getSectionsByCourseSchema>;
