import { CreateDiscussionRoomRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodSchema } from 'zod';

export const createDiscussionRoomSchema: ZodSchema<CreateDiscussionRoomRequest> =
  z.object({
    userRole: z.enum(['instructor', 'student'], {
      required_error: 'user role is required',
      message: 'user role must one of [instructor, student]',
    }),
    userId: z.string().uuid(),
    courseId: z.string().uuid(),
  });

export type CreateDiscussionRoomDto = z.infer<
  typeof createDiscussionRoomSchema
>;
