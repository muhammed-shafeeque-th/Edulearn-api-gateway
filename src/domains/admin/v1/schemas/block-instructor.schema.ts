import { z } from 'zod';

export const blockInstructorSchema = z.object({
  instructorId: z.string().uuid().uuid({ message: '`instructorId` must be type of UUID' }),
});

export type BlockInstructorType = z.infer<typeof blockInstructorSchema>;
