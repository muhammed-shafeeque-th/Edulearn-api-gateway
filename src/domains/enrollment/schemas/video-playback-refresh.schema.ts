import { z, ZodType } from 'zod';

export const videoPlaybackRefreshUrlSchema = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
  refreshToken: z.string(),
});

export type VideoPlaybackRefreshUrlSchemaType = z.infer<
  typeof videoPlaybackRefreshUrlSchema
>;
