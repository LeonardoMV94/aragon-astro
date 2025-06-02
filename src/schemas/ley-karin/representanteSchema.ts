import { z } from 'zod';
import { rutRegex, telefonoRegex } from '../utils';

export const representanteSchema = z.object({
  nombres_apellidos_representante: z
    .string()
    .max(85, { message: 'Los nombres y apellidos no deben exceder los 85 caracteres.' })
    .optional(), // Marcado como opcional inicialmente

  rut_representante: z
    .string()
    .max(12, { message: 'El RUT no debe exceder los 12 caracteres.' })
    .regex(rutRegex, { message: 'Formato de RUT inválido. Ej: 12.345.678-K o 12345678-K.' })
    .optional(), // Marcado como opcional inicialmente

  cargo_representante: z
    .string()
    .max(50, { message: 'El cargo no debe exceder los 50 caracteres.' })
    .optional(), // Marcado como opcional inicialmente

  area_representante: z
    .string()
    .max(60, { message: 'El área de trabajo no debe exceder los 60 caracteres.' })
    .optional(), // Marcado como opcional inicialmente

  email_representante: z
    .string()
    .email({ message: 'Debe ser un email válido.' })
    .optional(), // Marcado como opcional inicialmente

  telefono_contacto_representante: z
    .string()
    .max(12, { message: 'El teléfono de contacto no debe exceder los 12 caracteres.' })
    .regex(telefonoRegex, { message: 'Formato de teléfono inválido.' })
    .optional(), // Marcado como opcional inicialmente
});

export type RepresentanteFormData = z.infer<typeof representanteSchema>;
