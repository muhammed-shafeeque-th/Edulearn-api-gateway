import { z, ZodType } from 'zod';
import { CreateChatRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const createChatSchema: ZodType<CreateChatRequest> = z.object({
  studentId: z.string().uuid(),
  instructorId: z.string().uuid(),
  role: z.enum(['student', 'instructor']),
});

export type CreateChatDto = z.infer<typeof createChatSchema>;
