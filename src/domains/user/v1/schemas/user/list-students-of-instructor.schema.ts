import { ListStudentsOfInstructorRequest } from '@/domains/service-clients/user/proto/generated/user/types/instructor_student';
import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';

export const listStudentsOfInstructorSchema: ZodType<ListStudentsOfInstructorRequest> = z.object({
  instructorId: z.string().uuid(),
  pagination: paginationSchema,
});

export type ListStudentsOfInstructorType = z.infer<typeof listStudentsOfInstructorSchema>;
