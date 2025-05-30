// src/schemas/complianceSchema.ts
import { z } from "zod";

// Define el esquema Zod para tu formulario de denuncias
export const complianceFormSchema = z.object({
  fecha: z.string().nonempty("La fecha es obligatoria"),
  horario: z.string().nonempty("El horario es obligatorio"),
  lugarIncidente: z
    .string()
    .min(3, "El lugar debe tener al menos 3 caracteres"),
  incumplimientoAsociado: z.enum(
    [
      "Código de Ética",
      "Eventuales delitos",
      "Infracciones al Manual de prevención",
      "Otros",
    ],
    { errorMap: () => ({ message: "Selecciona un incumplimiento válido" }) },
  ),
  tipoInfraccion: z.enum(
    [
      "Aceptación de dinero o especies avaluadas en dinero",
      "Robo o hurto de dinero, información u otros valores",
      "Corrupción entre particulares",
      "Cohecho a funcionario público",
      "Delitos informáticos",
      "Incumplimiento normativa interna",
      "Otros",
    ],
    {
      errorMap: () => ({ message: "Selecciona un tipo de infracción válido" }),
    },
  ),
  colaboradoresInvolucrados: z.enum(
    ["colaborador1", "externo", "ambos", "nosabe"],
    { errorMap: () => ({ message: "Selecciona una opción válida" }) },
  ),
  identificacionInvolucrados: z
    .string()
    .min(3, "Debe ingresar identificación válida"),
  detallesInfraccion: z
    .string()
    .min(10, "Describe la infracción con al menos 10 caracteres"),
  periodoHechos: z.string().min(3, "Debe ingresar un período válido"),
  formaConocimiento: z
    .string({required_error: "Debe ingresar cómo tomó conocimiento de la información."})
    .min(3, "Debe tener al menos 3 caracteres"),
  nombreDenunciante: z.string().min(3, "El nombre es obligatorio"),
  correoDenunciante: z.string().email("Correo inválido"),
  telefonoDenunciante: z.string().min(9, "Teléfono inválido").regex(/^9\d{8}$/, {
    message: "Debe ser un número de celular chileno válido (ej: 912345678)",
  }),
  confidencialidad: z.enum(["si", "no"], {
    errorMap: () => ({ message: "Debe seleccionar una opción" }),
  }),
});
// Puedes inferir el tipo de TypeScript directamente desde el esquema Zod
export type ComplianceForm = z.infer<typeof complianceFormSchema>;
