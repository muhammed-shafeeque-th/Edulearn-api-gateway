import { z, ZodSchema } from 'zod';
import { GetDiscussionMessagesRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { paginationSchema } from '../pagination.schema';

export const getDiscussionMessagesSchema: ZodSchema<GetDiscussionMessagesRequest> =
  z.object({
    roomId: z.string().uuid(),
    userId: z.string().uuid(),
    pagination: paginationSchema.optional(),
  }) as unknown as ZodSchema<GetDiscussionMessagesRequest>;

export type GetDiscussionMessagesDto = z.infer<
  typeof getDiscussionMessagesSchema
>;
