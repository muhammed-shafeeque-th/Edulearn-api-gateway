import { CourseFilters } from '@/domains/service-clients/course/proto/generated/course/types/course';
import { z, ZodType } from 'zod';

export type CourseLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'all levels';

export const courseFiltersSchema: ZodType<CourseFilters> = z.object({
  search: z.string().optional(),
  // Accept comma-separated string, transform to array of strings
  category: z
    .string()
    .optional()
    .transform(str =>
      str
        ? str
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
    ),
  // Accept comma-separated string for level, validate each one is in enum
  level: z
    .string()
    .optional()
    .transform(str =>
      str
        ? str
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
    )
    .refine(
      arr =>
        Array.isArray(arr) &&
        arr.every(lvl =>
          ['beginner', 'intermediate', 'advanced', 'all levels'].includes(lvl)
        ),
      {
        message:
          "Levels must be a comma-separated list of 'beginner', 'intermediate', 'advanced', or 'all levels'",
      }
    ),
  minPrice: z
    .string()
    .optional()
    .transform(str =>
      str !== undefined && str !== '' ? Number(str) : undefined
    )
    .pipe(z.number().min(0, 'MinPrice must be at least Zero').optional()),
  maxPrice: z
    .string()
    .optional()
    .transform(str =>
      str !== undefined && str !== '' ? Number(str) : undefined
    )
    .pipe(z.number().min(0, 'MaxPrice must be at least one').optional()),
  rating: z
    .string()
    .optional()
    .transform(str => {
      // If undefined or empty string, treat as undefined (not required)
      if (str === undefined || str === '') return undefined;
      return Number(str);
    })
    .pipe(z.number().min(0).max(5).optional()),
}) as unknown as ZodType<CourseFilters>;

export type CourseFiltersDto = z.infer<typeof courseFiltersSchema>;
