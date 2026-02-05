import { z, ZodType } from 'zod';

export const videoPlaybackUrlSchema = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
});

export type VideoPlaybackUrlSchemaType = z.infer<typeof videoPlaybackUrlSchema>;
