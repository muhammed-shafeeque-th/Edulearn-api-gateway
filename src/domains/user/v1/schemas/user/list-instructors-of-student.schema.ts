import { ListInstructorsOfStudentRequest } from '@/domains/service-clients/user/proto/generated/user/types/instructor_student';
import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';

export const listInstructorsOfStudentSchema: ZodType<ListInstructorsOfStudentRequest> = z.object({
  studentId: z.string().uuid(),
  pagination: paginationSchema,
});

export type ListInstructorsOfStudentType = z.infer<typeof listInstructorsOfStudentSchema>;
