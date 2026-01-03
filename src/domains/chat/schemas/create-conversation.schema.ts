import { z, ZodType } from 'zod';
import { CreateConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const createConversationSchema: ZodType<CreateConversationRequest> =
  z.object({
    userId: z.string().uuid(),
    otherUserId: z.string().uuid(),
    role: z.string(),
    /** Optional for future: explicit type. */
    type: z.string(),
  });

export type CreateQuizDto = z.infer<typeof createConversationSchema>;
