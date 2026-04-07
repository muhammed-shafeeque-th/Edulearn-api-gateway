import { z } from 'zod';

export const getAllCategoriesSchema = z.object({
  includeDeleted: z.boolean().optional().default(false),
  activeOnly: z.boolean().optional().default(false),
});

export type GetAllCategoriesDto = z.infer<typeof getAllCategoriesSchema>;
