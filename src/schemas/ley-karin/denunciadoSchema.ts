import { z } from 'zod';
import { rutRegex } from '../utils';


export const denunciadoSchema = z.object({
  nombres_apellidos_denunciado: z
    .string()
    .min(1, { message: 'Nombres y Apellidos del denunciado son obligatorios.' })
    .max(85, { message: 'Los nombres y apellidos no deben exceder los 85 caracteres.' }),

  rut_denunciado: z
    .string()
    // El RUT del denunciado no tiene asterisco (*) en el HTML, lo que sugiere que no es requerido.
    // Sin embargo, es un dato sensible y podría ser importante.
    // Si debe ser opcional, solo usa .optional() y quita .min(1).
    // Por ahora, lo dejaremos como opcional si no es marcado como requerido en el HTML.
    .max(12, { message: 'El RUT no debe exceder los 12 caracteres.' })
    .regex(rutRegex, { message: 'Formato de RUT inválido. Ej: 12.345.678-K o 12345678-K.' })
    .optional(), // Marcado como opcional según el HTML proporcionado (no tiene *)

  cargo_denunciado: z
    .string()
    .max(50, { message: 'El cargo no debe exceder los 50 caracteres.' })
    .optional(), // Marcado como opcional según el HTML proporcionado (no tiene *)

  area_denunciado: z
    .string()
    .max(60, { message: 'El área de trabajo no debe exceder los 60 caracteres.' })
    .optional(), // Marcado como opcional según el HTML proporcionado (no tiene *)
});

export type DenunciadoFormData = z.infer<typeof denunciadoSchema>;
