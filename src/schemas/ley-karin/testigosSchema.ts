import { z } from 'zod';

export const testigosSchema = z.object({
  testigos: z
    .string()
    .max(1000, { message: 'La información de los testigos no debe exceder los 1000 caracteres.' })
    .optional(), // Este campo es opcional
});

export type TestigosFormData = z.infer<typeof testigosSchema>;
