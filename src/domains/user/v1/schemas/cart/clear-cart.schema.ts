import {  ClearCartRequest } from '@/domains/service-clients/user/proto/generated/user/types/cart_types';
import { z, ZodType } from 'zod';

export const clearCartSchema: ZodType<ClearCartRequest> = z.object({
  userId: z.string().uuid(),
});

export type UpdateQuizDto = z.infer<typeof clearCartSchema>;
