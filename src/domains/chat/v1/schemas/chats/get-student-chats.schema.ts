import { z, ZodType } from 'zod';
import { paginationSchema } from '../pagination.schema';
import { ListStudentChatsRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const getStudentChatsSchema: ZodType<ListStudentChatsRequest> = z.object(
  {
    studentId: z.string().uuid(),
    pagination: paginationSchema,
  }
);

export type GetChatsSchemaType = z.infer<typeof getStudentChatsSchema>;
