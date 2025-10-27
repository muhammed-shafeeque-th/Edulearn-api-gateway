import { CreateSectionRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

// export type BasicInfoRequestPayload = {
//   title: string;
//   durationValue: string;
//   durationUnit: string;
//   category: string;
//   subCategory: string;
//   instructorId: string;
//   topics?: string[];
//   language: string;
//   level: string;
//   subtitle?: string | undefined;
//   subtitleLanguage?: string | undefined;
// };

export const createSectionSchema: ZodType<CreateSectionRequest> = z.object({
  courseId: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  isPublished: z.boolean(),
});

export type CreateSectionDto = z.infer<typeof createSectionSchema>;
