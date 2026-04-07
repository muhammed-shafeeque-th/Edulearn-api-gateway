import { z } from 'zod';

export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});

export const toggleCategoryStatusSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteCategoryDto = z.infer<typeof deleteCategorySchema>;
export type ToggleCategoryStatusDto = z.infer<typeof toggleCategoryStatusSchema>;
