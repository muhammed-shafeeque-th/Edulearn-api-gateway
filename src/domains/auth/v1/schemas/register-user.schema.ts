import { z } from 'zod';
import { AuthType, UserRoles } from '../types';

export const RegisterUserSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, { message: 'firstName must be at least 3 characters long' })
      .regex(
        /^(?!\d)[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
        'First name must start with a letter, can contain letters, numbers, and spaces (no leading numbers or extra spaces)'
      ),
    lastName: z
      .string()
      .trim()
      .min(3, { message: 'lastName must be at least 3 characters long' })
      .regex(
        /^(?!\d)[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
        'Last name must start with a letter, can contain letters, numbers, and spaces (no leading numbers or extra spaces)'
      ),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(50)
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, {
        message:
          'Password must include at least one digit, one lowercase letter, one uppercase letter, and one special character',
      }),

    confirmPassword: z.string().nonempty(),
    role: z.enum(Object.values(UserRoles) as [string], {
      message: 'Invalid role. role must be one of roles*',
    }),
    avatar: z.string().optional(),
    authType: z.enum(Object.values(AuthType) as [string], {
      message: 'Invalid authType. type must be one of the auth types*',
    }), 
  })
  .refine(
    data => data.authType === AuthType.OAUTH || data.password !== undefined,
    {
      message: "Password is required unless",
      path: ['password'],
    }
  )
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
