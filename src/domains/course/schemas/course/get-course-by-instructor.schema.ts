import {
  GetCoursesByInstructorRequest,
} from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';

export const getCourseByInstructorSchema: ZodType<GetCoursesByInstructorRequest> =
  z.object({
    instructorId: z.string().uuid(),
    pagination: paginationSchema.default({
      page: 1,
      pageSize: 10,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
    }),
  }) as ZodType<GetCoursesByInstructorRequest>;

export type GetCourseByInstructorDto = z.infer<
  typeof getCourseByInstructorSchema
>;
