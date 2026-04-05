import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';
import { ListInstructorsRequest } from '@/domains/service-clients/user/proto/generated/user/types/instructor_types';
import { UserStatus } from '@/domains/service-clients/user/proto/generated/user/types/user_types';
import { SortOrder } from '@/domains/service-clients/user/proto/generated/user/common';

export const getInstructorsSchema: ZodType<ListInstructorsRequest> = z.object({
  pagination: paginationSchema,
  filter: z
    .object({
      search: z.string().optional(),
      status: z
        .string()
        .transform(val => {
          if (val === 'active') return UserStatus.ACTIVE;
          if (val === 'blocked') return UserStatus.BLOCKED;
          return UserStatus.USER_STATUS_UNSPECIFIED;
        })
        .optional(),
      role: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  sort: z
    .object({
      field: z.string(),
      order: z.preprocess(val => {
        if (val === 'asc') return SortOrder.ASC;
        if (val === 'desc') return SortOrder.DESC;
        return val;
      }, z.nativeEnum(SortOrder)),
    })
    .optional(),
}) as unknown as ZodType<ListInstructorsRequest>;

export type GetInstructorsType = z.infer<typeof getInstructorsSchema>;
