import { z } from 'zod';

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(80).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  parentId: z.string().uuid().optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
