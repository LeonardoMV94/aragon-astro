import { z } from 'zod';

export const antecedentesDenunciaSchema = z.object({
  // Radio buttons: ¿Qué situaciones se denuncian? (*)
  denuncia_antecedentes: z.enum(
    ['acoso_laboral', 'acoso_sexual', 'maltrato_laboral', 'otra_situacion_violencia_laboral'],
    {
      errorMap: () => ({ message: 'Debe seleccionar al menos una situación denunciada.' }),
    }
  ),

  // Checkboxes: Sobre la relación entre la víctima y el denunciado
  relacion_victima_denunciado_antecedentes: z
    .array(z.string())
    .optional(), // No tiene asterisco, por lo tanto, es opcional

  // Checkboxes: Sobre las presuntas situaciones denunciadas
  presuntas_situaciones_denunciadas_antecedentes: z
    .array(z.string())
    .optional(), // No tiene asterisco, por lo tanto, es opcional
});

export type AntecedentesDenunciaFormData = z.infer<typeof antecedentesDenunciaSchema>;
