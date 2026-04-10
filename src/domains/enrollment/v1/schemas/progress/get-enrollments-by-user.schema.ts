import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';
import { GetEnrollmentsByUserRequest } from '@/domains/service-clients/course/proto/generated/course/types/enrollment';

export const getEnrollmentByUserSchema: ZodType<GetEnrollmentsByUserRequest> =
  z.object({
    userId: z.string().uuid(),
    pagination: paginationSchema.default({
      page: 1,
      pageSize: 10,
      sortBy: 'updatedAt',
      sortOrder: 'DESC',
    }),
  }) as ZodType<GetEnrollmentsByUserRequest>;

export type GetEnrollmentByUserSchemaDto = z.infer<
  typeof getEnrollmentByUserSchema
>;
