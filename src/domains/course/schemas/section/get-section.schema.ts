import { CreateSectionRequest, GetSectionRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';


export const getSectionSchema: ZodType<GetSectionRequest> = z.object({
  sectionId: z.string(),
});

export type CreateSectionDto = z.infer<typeof getSectionSchema>;
