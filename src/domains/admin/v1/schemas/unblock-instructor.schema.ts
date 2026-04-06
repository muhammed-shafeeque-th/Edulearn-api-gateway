import { z } from 'zod';

export const unBlockInstructorSchema = z.object({
  instructorId: z.string().uuid().uuid({ message: '`instructorId` must be type of UUID' }),
});

export type UnBlockInstructorType = z.infer<typeof unBlockInstructorSchema>;
