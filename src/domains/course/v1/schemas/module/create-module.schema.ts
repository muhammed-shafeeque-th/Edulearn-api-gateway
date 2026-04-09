import { CreateModuleRequest } from '@/domains/service-clients/course/proto/generated/course/types/module';
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

export const createModuleSchema: ZodType<CreateModuleRequest> = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  isPublished: z.boolean(),
});

export type CreateModuleDto = z.infer<typeof createModuleSchema>;
