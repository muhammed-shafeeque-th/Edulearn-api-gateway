import { z, ZodType } from 'zod';
import { GetConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const getConversationSchema: ZodType<GetConversationRequest> = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type GetConversationSchemaType = z.infer<typeof getConversationSchema>;
