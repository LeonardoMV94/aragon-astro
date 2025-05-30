// src/pages/api/contact.ts
import type { APIRoute } from "astro";
import { Resend } from "resend";
import { z } from "zod"; // Importamos Zod
import { createClient, type Client } from "@libsql/client"; // Importar el cliente de Turso y el tipo Client
const contactoSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre es demasiado largo."),
  email: z.string().email("El formato del correo electrónico no es válido."),
  asunto: z
    .string()
    .min(5, "El asunto debe tener al menos 5 caracteres.")
    .max(200, "El asunto es demasiado largo."),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(2000, "El mensaje es demasiado largo."),
    'bot-field': z.string().optional(),
});

// --- Variables de Entorno ---
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const TARGET_EMAIL = import.meta.env.EMAIL_TARGET; // Correo de destino
const FROM_EMAIL = import.meta.env.EMAIL_FROM; // Correo de remitente (verificado en Resend)

// Variables de entorno para Turso
const TURSO_DATABASE_URL = import.meta.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = import.meta.env.TURSO_AUTH_TOKEN;

// --- Instancias de Clientes ---
const resend = new Resend(RESEND_API_KEY);

// Corrección aquí: Definir el tipo explícitamente para tursoClient
let tursoClient: Client | null = null; // Puede ser Client o null

if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
  try {
    tursoClient = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
  } catch (e) {
    console.error(
      "ERROR: No se pudo inicializar el cliente de Turso. Verifique las variables de entorno o la conexión.",
      e,
    );
    // Asegurarse de que tursoClient permanezca null si falla la inicialización
    tursoClient = null;
  }
} else {
  console.warn(
    "ADVERTENCIA: Variables de entorno de Turso (TURSO_DATABASE_URL o TURSO_AUTH_TOKEN) no están configuradas. Los datos NO se guardarán en la base de datos.",
  );
}

// // --- Esquema de Validación con Zod ---
// const ContactFormSchema = z.object({
//   name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").max(100, "El nombre es demasiado largo."),
//   email: z.string().email("El formato del correo electrónico no es válido."),
//   subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres.").max(200, "El asunto es demasiado largo."),
//   message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres.").max(2000, "El mensaje es demasiado largo."),
//   // Puedes añadir un campo honeypot aquí también, si lo implementas en el formulario
//   // hp_field: z.string().optional(), // Este campo se ignoraría si está lleno en la validación
// });

// --- APIRoute POST Handler ---
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const formValues = Object.fromEntries(formData.entries());

    // Si implementaste un honeypot, añádelo aquí para una validación temprana
    // if (formValues.hp_field && formValues.hp_field !== '') {
    //   console.warn("Intento de spam detectado (honeypot activado).");
    //   return new Response(JSON.stringify({
    //     status: "success", // Respondemos con éxito para no alertar al bot
    //     message: "¡Gracias por tu mensaje!"
    //   }), {
    //     status: 200,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }

    // Validar los datos con Zod
    const validationResult = contactoSchema.safeParse(formValues);

    if (!validationResult.success) {
      // Si la validación falla, devuelve un error 400 con los mensajes de Zod
      const errors = validationResult.error.errors
        .map((err) => err.message)
        .join(", ");
      console.error(
        "Error de validación del formulario de contacto:",
        validationResult.error.errors,
      );
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Datos de formulario inválidos: ${errors}`,
          errors: validationResult.error.errors, // Opcional: enviar detalles de los errores
        }),
        {
          status: 400, // Bad Request
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Datos validados
    const { name, email, asunto, message } = validationResult.data;

    // --- 1. Guardar en Turso ---
    if (tursoClient) {
      // TypeScript ahora sabe que tursoClient es de tipo Client aquí
      try {
        // await tursoClient.execute({
        //   sql: "INSERT INTO form_contacto (name, email, subject, message) VALUES (?, ?, ?, ?)",
        //   args: [name, email, subject, message],
        // });
        console.log("Datos de contacto guardados en Turso.");
      } catch (dbError) {
        console.error("Error al guardar en la base de datos Turso:", dbError);
        // Aunque haya error en DB, la función continuará intentando enviar el email.
        // Si la persistencia en DB es crítica para esta funcionalidad, podrías devolver un error aquí.
      }
    } else {
      console.warn(
        "Cliente de Turso no inicializado. Los datos de contacto NO se guardaron en la base de datos.",
      );
    }

    // --- 2. Enviar Correo Electrónico ---
    // Verificar que las variables de entorno para el envío de correo existan antes de intentar enviar
    if (!RESEND_API_KEY || !TARGET_EMAIL || !FROM_EMAIL) {
      console.error(
        "Faltan variables de entorno cruciales para el envío de correo. No se puede enviar el email.",
      );
      // Si la DB falla, y el email también por falta de config, esto sí es un error crítico
      return new Response(
        JSON.stringify({
          status: "error",
          message:
            "Error de configuración del servidor. Contacte al administrador. (Faltan variables de Resend)",
        }),
        {
          status: 500, // Internal Server Error
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TARGET_EMAIL,
        subject: `AragonLtda.cl | Nuevo mensaje de contacto: ${asunto}`,
        html: `
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${asunto}</p>
          <p><strong>Mensaje:</strong> <br>${message.replace(/\n/g, "<br>")}</p>
        `,
      });
      console.log(
        `Mensaje de contacto recibido de ${name} <${email}>. Asunto: ${asunto}`,
      );
    } catch (emailError) {
      console.error("Error al enviar el correo con Resend:", emailError);
      // Si el correo falla, pero se guardó en la DB (si estaba configurada),
      // se puede seguir adelante con una respuesta de éxito al usuario,
      // ya que el dato principal está guardado.
      // Sin embargo, si el correo es la notificación principal, considera el impacto.
    }

    // --- 3. Respuesta Exitosa al Cliente ---
    return new Response(
      JSON.stringify({
        status: "success",
        message: "¡Tu mensaje ha sido enviado con éxito!",
      }),
      {
        status: 200, // OK
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(
      "Error general al procesar el formulario de contacto:",
      error,
    );
    // Para errores internos del servidor, evita dar demasiados detalles al cliente.
    return new Response(
      JSON.stringify({
        status: "error",
        message:
          "Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
      }),
      {
        status: 500, // Internal Server Error
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
