import { z } from 'zod';
import { denuncianteSchema } from './denuncianteSchema';
import { representanteSchema } from './representanteSchema';
import { denunciadoSchema } from './denunciadoSchema';
import { antecedentesDenunciaSchema } from './antecedentesDenunciaSchema';
import { testigosSchema } from './testigosSchema';
import { relatoDenunciaSchema } from './relatoDenunciaSchema';
import { documentosRespaldoSchema } from './documentosRespaldoSchema'; // Importa el nuevo esquema

// Se mantiene la regex de RUT aquí también para usarla en el superRefine
const rutRegex = /^\d{1,2}(?:\.\d{3}){2}[-][0-9kK]$|^\d{7,8}[-][0-9kK]$/;

export const leyKarinSchema = z.object({
  denunciante: denuncianteSchema,
  representante: representanteSchema,
  denunciado: denunciadoSchema,
  antecedentes_denuncia: antecedentesDenunciaSchema,
  testigos: testigosSchema,
  relato_denuncia: relatoDenunciaSchema,
  documentos_respaldo: documentosRespaldoSchema, // Añade el esquema de documentos de respaldo aquí
}).superRefine((data, ctx) => {
  // Lógica de validación condicional para DATOS DEL REPRESENTANTE
  if (data.denunciante.quien_realiza_denuncia === 'No') {
    if (!data.representante.nombres_apellidos_representante || data.representante.nombres_apellidos_representante.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nombres y Apellidos del representante son obligatorios cuando no se es la víctima.',
        path: ['representante', 'nombres_apellidos_representante'],
      });
    }
    if (!data.representante.rut_representante || data.representante.rut_representante.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rut del representante es obligatorio cuando no se es la víctima.',
        path: ['representante', 'rut_representante'],
      });
    } else if (!rutRegex.test(data.representante.rut_representante)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Formato de RUT del representante inválido. Ej: 12.345.678-K o 12345678-K.',
        path: ['representante', 'rut_representante'],
      });
    }
    if (!data.representante.cargo_representante || data.representante.cargo_representante.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cargo del representante es obligatorio cuando no se es la víctima.',
        path: ['representante', 'cargo_representante'],
      });
    }
    if (!data.representante.area_representante || data.representante.area_representante.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Área de trabajo del representante es obligatoria cuando no se es la víctima.',
        path: ['representante', 'area_representante'],
      });
    }
    if (!data.representante.email_representante || data.representante.email_representante.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email del representante es obligatorio cuando no se es la víctima.',
        path: ['representante', 'email_representante'],
      });
    } else if (!z.string().email().safeParse(data.representante.email_representante).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe ser un email válido para el representante.',
        path: ['representante', 'email_representante'],
      });
    }
    if (!data.representante.telefono_contacto_representante || data.representante.telefono_contacto_representante.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Teléfono de contacto del representante es obligatorio cuando no se es la víctima.',
        path: ['representante', 'telefono_contacto_representante'],
      });
    } else if (!/^[\d\s\-\(\)]+$/.test(data.representante.telefono_contacto_representante)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Formato de teléfono del representante inválido.',
        path: ['representante', 'telefono_contacto_representante'],
      });
    }
  }
});

export type LeyKarinFormData = z.infer<typeof leyKarinSchema>;
