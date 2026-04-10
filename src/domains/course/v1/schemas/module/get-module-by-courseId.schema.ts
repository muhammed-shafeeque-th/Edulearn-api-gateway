import {
  GetModulesByCourseRequest,
} from '@/domains/service-clients/course/proto/generated/course/types/module';
import { z, ZodType } from 'zod';

export const getModulesByCourseSchema: ZodType<GetModulesByCourseRequest> =
  z.object({
    courseId: z.string().uuid(),
  });

export type GetModulesByCourseDto = z.infer<typeof getModulesByCourseSchema>;
