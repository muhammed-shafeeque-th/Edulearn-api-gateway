import { ValidationError } from '@/shared/errors/validation-error';
import { ZodError, ZodType } from 'zod';

export default function validateSchema<T extends ZodType>(
  data: unknown,
  schema: T
): ReturnType<T['parse']> | undefined {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}
