import { z } from 'zod';

export const relatoDenunciaSchema = z.object({
  namerelatoSituacionDenunciadaHoja1: z
    .string()
    .min(1, { message: 'El relato de la situación denunciada (Hoja 1) es obligatorio.' })
    .max(3450, { message: 'La Hoja 1 del relato no debe exceder los 3450 caracteres.' }),

  namerelatoSituacionDenunciadaHoja2: z
    .string()
    .max(3450, { message: 'La Hoja 2 del relato no debe exceder los 3450 caracteres.' })
    .optional(), // Este campo es opcional
});

export type RelatoDenunciaFormData = z.infer<typeof relatoDenunciaSchema>;
