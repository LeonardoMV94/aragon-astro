// src/pages/api/contact.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parsear los datos del formulario
    // Si el formulario es POST con method="POST" sin JavaScript,
    // los datos vienen como FormData.
    const formData = await request.formData();

    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject'); // Asegúrate que el 'name' en el input sea 'subject'
    const message = formData.get('message');

    // ** 2. Validaciones básicas (opcional pero muy recomendado) **
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Por favor, complete todos los campos requeridos.'
      }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ** 3. Aquí puedes añadir tu lógica de procesamiento **
    // Ejemplos:

    // a) Enviar a un servicio de email (ej. SendGrid, Resend, Nodemailer)
    // Para esto necesitarías instalar una librería como `resend` o `nodemailer`
    // y configurar tus claves API como variables de entorno en Netlify.
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev', // Tu dominio verificado con Resend
      to: 'tu_correo_destino@ejemplo.com', // El correo al que quieres que lleguen los mensajes
      subject: `Nuevo mensaje de contacto: ${subject}`,
      html: `
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong> ${message}</p>
      `,
    });
    */

    // b) Almacenar en una base de datos (ej. Supabase, MongoDB Atlas, FaunaDB)
    // Esto requeriría la configuración de clientes de base de datos.

    // c) Enviar a un servicio de Slack, Discord, etc. vía webhook.

    // ** 4. Respuesta exitosa al cliente **
    return new Response(JSON.stringify({
      status: 'success',
      message: '¡Tu mensaje ha sido enviado con éxito!'
    }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
    }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
