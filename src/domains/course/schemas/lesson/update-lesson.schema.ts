import { UpdateLessonRequest } from '@/domains/service-clients/course/proto/generated/course/types/lesson';
import { z, ZodType } from 'zod';

export const updateLessonSchema: ZodType<UpdateLessonRequest> = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  sectionId: z.string().uuid(),
  contentType: z.string().optional(),
  contentUrl: z.string().optional(),
  description: z.string().optional(),
  isPreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  estimatedDuration: z.number().optional(),
  order: z.number().optional(),
  title: z.string().optional(),
  metadata: z.record(z.any()),
});

export type CreateLessonDto = z.infer<typeof updateLessonSchema>;
