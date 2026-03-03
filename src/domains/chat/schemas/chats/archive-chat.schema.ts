import { ArchiveChatRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const archiveChatSchema: ZodType<ArchiveChatRequest> =
  z.object({
    userId: z.string().uuid(),
    chatId: z.string().uuid(),
  });

export type ArchiveChatSchema = z.infer<
  typeof archiveChatSchema
>;
