import { z, ZodType } from 'zod';
import { SortOrder as GrpcSortOrder } from '@/domains/service-clients/user/proto/generated/user/common';
import {
  GetUsersRequest,
  UserStatus as GrpcUserStatus,
} from '@/domains/service-clients/user/proto/generated/user/types/user_types';
import { paginationSchema } from './pagination.schema';

// -- CREATE ZOD ENUMS THAT MIRROR GRPC ENUMS FOR MAPPING --
const sortOrderSchema = z
  .string()
  .optional()
  .transform(v => {
    const normalized = (v || '').toUpperCase();
    switch (normalized) {
      case 'ASC':
        return GrpcSortOrder.ASC;
      case 'DESC':
        return GrpcSortOrder.DESC;
      default:
        return GrpcSortOrder.SORT_ORDER_UNSPECIFIED;
    }
  });

const userStatusSchema = z
  .string()
  .optional()
  .transform(v => {
    const normalized = (v || '').toUpperCase();
    switch (normalized) {
      case 'ACTIVE':
        return GrpcUserStatus.ACTIVE;
      case 'BLOCKED':
        return GrpcUserStatus.BLOCKED;
      case 'DELETED':
        return GrpcUserStatus.DELETED;
      default:
        return GrpcUserStatus.USER_STATUS_UNSPECIFIED;
    }
  });

// --- ZOD SCHEMAS ---

const sortOptionSchema = z
  .object({
    sortBy: z.string().min(1, { message: 'Sort field is required' }),
    sortOrder: sortOrderSchema,
  })
  .transform(sort => ({
    field: sort.sortBy,
    order: sort.sortOrder,
  }));

const userFilterSchema = z
  .object({
    status: userStatusSchema,
    email: z.string().email().optional(),
    role: z.string().optional(),
    search: z.string().optional(),
  })
  .partial();


export const getUsersRequestSchema: ZodType<GetUsersRequest> = z
  .object({
    pagination: paginationSchema.optional(),
    filter: userFilterSchema.optional(),
    sort: sortOptionSchema.optional(),
  })
  .default({
    pagination: {
      page: 1,
      pageSize: 10,
    },
    filter: {},
    sort: undefined,
  })
  .transform(data => ({
    pagination: data.pagination ?? {},
    filter: data.filter ?? {},
    sort: data.sort,
  })) as unknown as ZodType<GetUsersRequest>;

// --- Aliasing for compatibility with previous type/usage ---
export const getUsersSchema = getUsersRequestSchema;
export type GetUsersSchemaType = z.infer<typeof getUsersRequestSchema>;
