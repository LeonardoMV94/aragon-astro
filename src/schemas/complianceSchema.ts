// src/schemas/complianceSchema.ts
import { z } from 'zod';

// Define el esquema Zod para tu formulario de denuncias
export const complianceFormSchema = z.object({
  fecha: z.string({
    required_error: 'La fecha es requerida.',
    invalid_type_error: 'El formato de la fecha no es válido.'
  }).min(1, 'La fecha no puede estar vacía.'),

  horario: z.string({
    required_error: 'El horario es requerido.',
    invalid_type_error: 'El formato del horario no es válido.'
  }).min(1, 'El horario no puede estar vacío.'),

  lugarIncidente: z.string({
    required_error: 'El lugar del incidente es requerido.',
    invalid_type_error: 'El lugar del incidente debe ser texto.'
  }).min(3, 'El lugar del incidente debe tener al menos 3 caracteres.'), // Añadido min length

  incumplimientoAsociado: z.enum([
    'Código de Ética',
    'Eventuales delitos',
    'Infracciones al Manual de prevención',
    'Otros',
  ], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: 'Por favor, selecciona una opción válida para "Incumplimiento asociado a".' };
      }
      if (issue.code === z.ZodIssueCode.invalid_type) {
        return { message: 'Debes seleccionar una opción para "Incumplimiento asociado a".' };
      }
      return { message: ctx.defaultError };
    },
  }),

  tipoInfraccion: z.enum([
    'Aceptación de dinero o especies avaluadas en dinero',
    'Robo o hurto de dinero, información u otros valores',
    'Corrupción entre particulares',
    'Cohecho a funcionario público',
    'Delitos informáticos',
    'Incumplimiento normativa interna',
    'Otros',
  ], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: 'Por favor, selecciona una opción válida para "Tipo de infracción".' };
      }
      if (issue.code === z.ZodIssueCode.invalid_type) {
        return { message: 'Debes seleccionar una opción para "Tipo de infracción".' };
      }
      return { message: ctx.defaultError };
    },
  }),

  colaboradoresInvolucrados: z.enum([
    'colaborador1', // Esto se mapea a 'Interno'
    'externo',
    'ambos',
    'nosabe',
  ], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: 'Por favor, selecciona una opción válida para "Colaboradores involucrados".' };
      }
      if (issue.code === z.ZodIssueCode.invalid_type) {
        return { message: 'Debes seleccionar una opción para "Colaboradores involucrados".' };
      }
      return { message: ctx.defaultError };
    },
  }),

  identificacionInvolucrados: z.string({
    required_error: 'La identificación de los involucrados es requerida.',
    invalid_type_error: 'La identificación debe ser texto.'
  }).min(5, 'La identificación de los involucrados debe tener al menos 5 caracteres.'), // Añadido min length

  detallesInfraccion: z.string({
    required_error: 'Los detalles de la infracción son requeridos.',
    invalid_type_error: 'Los detalles de la infracción deben ser texto.'
  }).min(20, 'Los detalles de la infracción deben ser más específicos (al menos 20 caracteres).'), // Añadido min length

  periodoHechos: z.string({
    required_error: 'El periodo en el que han ocurrido los hechos es requerido.',
    invalid_type_error: 'El periodo de los hechos debe ser texto.'
  }).min(5, 'El periodo de los hechos debe tener al menos 5 caracteres.'), // Añadido min length

  formaConocimiento: z.string({
    required_error: 'La forma de conocimiento es requerida.',
    invalid_type_error: 'La forma de conocimiento debe ser texto.'
  }).min(5, 'La forma de conocimiento debe tener al menos 5 caracteres.'), // Añadido min length

  // Campos de contacto (opcionales)
  // Nota: Si un campo opcional se envía pero con un valor no válido, Zod lo marcará como error.
  // Si está completamente vacío o no se envía, Zod lo ignora.
  name: z.string().trim().optional(), // trim() para eliminar espacios en blanco al inicio/final
  email: z.string().email('Ingresa un correo electrónico válido.').optional().or(z.literal('')),
  telefonoContacto: z.string().optional(),

  confidencialidad: z.enum(['si', 'no'], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value || issue.code === z.ZodIssueCode.invalid_type) {
        return { message: 'Debes seleccionar una opción de confidencialidad.' };
      }
      return { message: ctx.defaultError };
    },
  }),
});

// Puedes inferir el tipo de TypeScript directamente desde el esquema Zod
export type ComplianceForm = z.infer<typeof complianceFormSchema>;
