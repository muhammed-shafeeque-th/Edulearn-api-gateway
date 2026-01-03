import { PinConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const unPinConversationSchema: ZodType<PinConversationRequest> =
  z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
  });

export type UnPinConversationSchemaType = z.infer<
  typeof unPinConversationSchema
>;
