import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
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

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
