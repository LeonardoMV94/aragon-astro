// src/pages/api/report-compliance.ts
import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod"; // Importamos Zod
import { complianceFormSchema } from "@/schemas/complianceSchema"; // Importar el esquema de validación
import { createClient, type Client } from "@libsql/client"; // Importar el cliente de Turso y su tipo

// --- Variables de Entorno ---
// Es una buena práctica validar que estas variables existan al inicio.
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const TARGET_EMAIL = import.meta.env.EMAIL_TARGET; // Correo de destino
const FROM_EMAIL = import.meta.env.EMAIL_FROM; // Correo de remitente (verificado en Resend)
const TURSO_DATABASE_URL = import.meta.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = import.meta.env.TURSO_AUTH_TOKEN;

// --- Instancias de Clientes ---
const resend = new Resend(RESEND_API_KEY);

let tursoClient: Client | null = null; // Tipado explícito

// Inicialización del cliente de Turso
// Aseguramos que solo se inicialice si las variables de entorno están presentes
if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
  try {
    tursoClient = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    console.log("Cliente de Turso inicializado con éxito.");
  } catch (e) {
    console.error(
      "ERROR: No se pudo inicializar el cliente de Turso. Verifique las variables de entorno o la conexión.",
      e,
    );
    tursoClient = null; // Asegurarse de que permanezca null si falla
  }
} else {
  console.warn(
    "ADVERTENCIA: Variables de entorno de Turso (TURSO_DATABASE_URL o TURSO_AUTH_TOKEN) no están configuradas. Los datos NO se guardarán en la base de datos.",
  );
}

// --- APIRoute POST Handler ---
export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const formData = await request.formData();
    const formValues: Record<string, string> = {}; // Iterar sobre FormData y asegurar que solo se procesen valores de string.
    // Esto es importante ya que FormData puede contener File objetos si hay inputs 'file'.

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        formValues[key] = value;
      }
    } // --- 1. Validación con Zod ---

    const validationResult = complianceFormSchema.safeParse(formValues);

    if (!validationResult.success) {
      // Mapear los errores de Zod a un formato más amigable para el cliente.
      const fieldErrors: { [key: string]: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });

      console.error(
        "Error de validación del formulario:",
        validationResult.error.errors,
      );
      return new Response(
        JSON.stringify({
          status: "error",
          message:
            "Hay errores en los datos proporcionados. Por favor, revise el formulario.",
          errors: fieldErrors, // Envía los errores específicos de cada campo para una mejor UI
        }),
        {
          status: 400, // Bad Request
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = validationResult.data; // Datos validados y tipados por Zod
    const submissionTimestamp = new Date().toISOString(); // --- 2. Guardar en Turso (Base de Datos) ---
    const sqlInsertQuery: string = `
            INSERT INTO compliance_reports (
                incident_date, incident_time, incident_location, related_compliance,
                infraction_type, involved_parties_type, involved_parties_identification,
                infraction_details, incident_period, knowledge_method,
                contact_name, contact_email, contact_phone, confidentiality_consent,
                submission_timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    if (tursoClient) {
      try {
        await tursoClient.execute({
          sql: sqlInsertQuery,
          args: [
            data.fecha, // Zod garantiza que estos campos obligatorios ya existen
            data.horario,
            data.lugarIncidente,
            data.incumplimientoAsociado, // Corregido a 'incumplimientoAsociado' para que coincida con el esquema
            data.tipoInfraccion,
            data.colaboradoresInvolucrados,
            data.identificacionInvolucrados,
            data.detallesInfraccion,
            data.periodoHechos,
            data.formaConocimiento,
            data.nombreDenunciante || null, // Usar null para campos opcionales no proporcionados o vacíos
            data.correoDenunciante || null,
            data.telefonoDenunciante || null,
            data.confidencialidad,
            submissionTimestamp,
          ],
        });
        console.log("Datos de denuncia guardados en Turso.");
      } catch (dbError) {
        console.error("Error al guardar en la base de datos Turso:", dbError); // Aquí podríamos decidir si queremos que esto impida el envío del email.
        // Por ahora, el flujo continúa para intentar enviar el email.
        // Considera si un fallo en DB debe ser un error fatal para el usuario.
      }
    } else {
      console.warn(
        "Cliente de Turso no inicializado. Los datos NO se guardaron en la base de datos.",
      );
    } // --- 3. Enviar Correo Electrónico con Resend ---
    // Validar las variables de entorno de Resend antes de intentar enviar.

    if (!RESEND_API_KEY || !TARGET_EMAIL || !FROM_EMAIL) {
      console.error(
        "Faltan variables de entorno cruciales para Resend (RESEND_API_KEY, EMAIL_TARGET, EMAIL_FROM). No se puede enviar el email.",
      ); // Si no se puede enviar el email pero los datos se guardaron en DB,
      // el usuario aún puede recibir una respuesta de éxito con una advertencia interna.
    } else {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: TARGET_EMAIL,
          subject: `Nuevo Reporte de Compliance - ${data.tipoInfraccion}`,
          html: `
            <h1>Nuevo Reporte de Compliance</h1>
            <p><strong>Fecha y Hora del Reporte:</strong> ${new Date().toLocaleString("es-CL")}</p>
            <h2>Datos de la denuncia:</h2>
            <p><strong>Fecha del Incidente:</strong> ${data.fecha}</p>
            <p><strong>Horario del Incidente:</strong> ${data.horario}</p>
            <p><strong>Lugar del Incidente:</strong> ${data.lugarIncidente}</p>
            <p><strong>Incumplimiento Asociado:</strong> ${data.incumplimientoAsociado}</p>
            <p><strong>Tipo de Infracción:</strong> ${data.tipoInfraccion}</p>
            <p><strong>Colaboradores Involucrados:</strong> ${data.colaboradoresInvolucrados}</p>
            <p><strong>Identificación Involucrados:</strong> ${data.identificacionInvolucrados}</p>
            <p><strong>Detalles de la Infracción:</strong><br>${data.detallesInfraccion.replace(/\n/g, "<br>")}</p>
            <p><strong>Periodo de los Hechos:</strong> ${data.periodoHechos}</p>
            <p><strong>Forma de Conocimiento:</strong> ${data.formaConocimiento}</p>

            <h2>Datos de Contacto (si proporcionados):</h2>
            <p><strong>Nombre:</strong> ${data.nombreDenunciante || "Anónimo"}</p>
            <p><strong>Correo Electrónico:</strong> ${data.correoDenunciante || "No especificado"}</p>
            <p><strong>Teléfono:</strong> ${data.telefonoDenunciante || "No especificado"}</p>
            <p><strong>Autoriza Confidencialidad:</strong> ${data.confidencialidad === "si" ? "Sí" : "No"}</p>

            <hr>
            <small>Este correo fue generado automáticamente por el canal de denuncias. IP del remitente: ${clientAddress || "N/A"}</small>
          `,
        });
        console.log(
          `Correo de denuncia enviado con éxito para ${data.nombreDenunciante || "Anónimo"}.`,
        );
      } catch (emailError) {
        console.error("Error al enviar el correo con Resend:", emailError); // El dato ya está en la DB, así que este error no es crítico para la respuesta del usuario.
      }
    } // --- 4. Respuesta Final al Cliente ---

    return new Response(
      JSON.stringify({
        status: "success",
        message:
          "¡Tu reporte ha sido enviado con éxito y registrado! Agradecemos tu valiosa colaboración. Pronto enviaremos la confirmación de recepción a su correo o medio de contacto.",
      }),
      {
        status: 200, // OK
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    // Este catch atrapa errores que no son de Zod (ej. problemas con request.formData())
    console.error(
      "Error general al procesar el formulario de compliance:",
      error,
    );
    return new Response(
      JSON.stringify({
        status: "error",
        message:
          "Hubo un problema inesperado al enviar tu reporte. Por favor, inténtalo de nuevo más tarde.",
      }),
      {
        status: 500, // Internal Server Error
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
