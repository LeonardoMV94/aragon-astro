import { z } from 'zod';
import { rutRegex, telefonoRegex } from '../utils';


export const denuncianteSchema = z.object({
  formulario_enviado: z.literal('1').optional(),
  asunto_denunciante: z
    .string()
    .min(1, { message: 'El asunto es obligatorio.' })
    .max(85, { message: 'El asunto no debe exceder los 85 caracteres.' }),
  nombres_apellidos_denunciante: z
    .string()
    .min(1, { message: 'Los nombres y apellidos son obligatorios.' })
    .max(85, { message: 'Los nombres y apellidos no deben exceder los 85 caracteres.' }),
  rut_denunciante: z
    .string()
    .min(1, { message: 'El RUT es obligatorio.' })
    .max(12, { message: 'El RUT no debe exceder los 12 caracteres.' })
    .regex(rutRegex, { message: 'Formato de RUT inválido. Ej: 12.345.678-K o 12345678-K.' }),
  cargo_denunciante: z
    .string()
    .min(1, { message: 'El cargo es obligatorio.' })
    .max(50, { message: 'El cargo no debe exceder los 50 caracteres.' }),
  area_denunciante: z
    .string()
    .min(1, { message: 'El área de trabajo es obligatoria.' })
    .max(60, { message: 'El área de trabajo no debe exceder los 60 caracteres.' }),
  email_denunciante: z
    .string()
    .min(1, { message: 'El email es obligatorio.' })
    .email({ message: 'Debe ser un email válido.' }),
  telefono_contacto_denunciante: z
    .string()
    .min(1, { message: 'El teléfono de contacto es obligatorio.' })
    .max(15, { message: 'El teléfono de contacto no debe exceder los 15 caracteres.' })
    .regex(telefonoRegex, { message: 'Formato de teléfono inválido. Ej: 9XXXXXXXX' }),
  quien_realiza_denuncia: z.enum(['si', 'no'], {
    errorMap: () => ({ message: 'Debe seleccionar si es la presunta víctima.' }),
  }),
  // opcion_empresa_seleccionada: z
  //   .string()
  //   .refine((val) => val !== '', { message: 'Debe seleccionar su empresa.' }),
  // confirmacion_empresa_seleccionada: z
  //   .string()
  //   .refine((val) => val !== '', { message: 'Debe confirmar su empresa.' }),
})
.superRefine((data, ctx) => {
  // if (data.opcion_empresa_seleccionada !== data.confirmacion_empresa_seleccionada) {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     message: 'Las empresas seleccionadas no coinciden.',
  //     path: ['confirmacion_empresa_seleccionada'],
  //   });
  // }
});

export type DenuncianteFormData = z.infer<typeof denuncianteSchema>;
