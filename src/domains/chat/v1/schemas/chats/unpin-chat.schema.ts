import { PinChatRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const unPinChatSchema: ZodType<PinChatRequest> =
  z.object({
    userId: z.string().uuid(),
    chatId: z.string().uuid(),
  });

export type UnPinChatSchemaType = z.infer<
  typeof unPinChatSchema
>;
