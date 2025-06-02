import { z } from 'zod';

export const documentosRespaldoSchema = z.object({
  // Para el input type="file", Zod lo trata como un FileList (si se selecciona 1 archivo)
  // o undefined/null si no se selecciona nada.
  // La validación de tipo de archivo y tamaño debe hacerse fuera de Zod en el frontend
  // y obligatoriamente en el backend.
  upload_file: z
    .any() // Usamos 'any' porque la validación real del archivo es compleja y se hace a nivel de JS/backend.
    .optional(), // No tiene asterisco, así que es opcional.

  url_dadoPorUsuario_2: z
    .string()
    .url({ message: 'Debe ser una URL válida.' }) // Valida que sea un formato de URL válido
    .optional() // No tiene asterisco, así que es opcional.
    .or(z.literal('')) // Permite que el campo esté vacío si es opcional
    .transform(e => e === '' ? undefined : e), // Transforma strings vacíos a undefined

  url_dadoPorUsuario_3: z
    .string()
    .url({ message: 'Debe ser una URL válida.' }) // Valida que sea un formato de URL válido
    .optional() // Es explícitamente "Opcional" en el HTML
    .or(z.literal('')) // Permite que el campo esté vacío si es opcional
    .transform(e => e === '' ? undefined : e), // Transforma strings vacíos a undefined
});

export type DocumentosRespaldoFormData = z.infer<typeof documentosRespaldoSchema>;
