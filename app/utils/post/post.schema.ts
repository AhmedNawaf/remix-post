import { z } from 'zod';

const FormErrorSchema = z
  .object({
    title: z.string().nullish(),
    description: z.string().nullish(),
  })
  .nullish();

type TFormError = z.infer<typeof FormErrorSchema>;

const PostFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' }),
});

export { FormErrorSchema, type TFormError, PostFormSchema };
