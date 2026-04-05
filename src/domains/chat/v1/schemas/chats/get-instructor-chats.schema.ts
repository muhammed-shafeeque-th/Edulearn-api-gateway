import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';
import { ListInstructorChatsRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const getInstructorChatsSchema: ZodType<ListInstructorChatsRequest> =
  z.object({
    instructorId: z.string().uuid(),
    pagination: paginationSchema,
  });

export type GetChatsSchemaType = z.infer<typeof getInstructorChatsSchema>;
