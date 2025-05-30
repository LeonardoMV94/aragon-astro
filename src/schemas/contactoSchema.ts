import { z } from "zod";

export const contactoSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre es demasiado largo."),
  email: z.string().email("El formato del correo electrónico no es válido."),
  asunto: z
    .string()
    .min(5, "El asunto debe tener al menos 5 caracteres.")
    .max(200, "El asunto es demasiado largo."),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(2000, "El mensaje es demasiado largo."),
    'bot-field': z.string().optional(),
});

export type ContactoForm = z.infer<typeof contactoSchema>;
