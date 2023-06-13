import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(255),
  email: z
    .string()
    .email('Enter a valid email format')
    .endsWith('@gmail.com', 'Enter a gmail email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email format')
    .endsWith('@gmail.com', 'Enter a gmail email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255),
});

export const FromErrorsSchema = z
  .object({
    username: z.string().nullish(),
    email: z.string().nullish(),
    password: z.string().nullish(),
    formError: z.string().nullish(),
  })
  .nullish();

export type TRegisterFromErrors = z.infer<typeof FromErrorsSchema>;
