// src/pages/api/report-compliance.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Asegúrate de tener esta variable de entorno configurada en Netlify
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const TARGET_EMAIL = import.meta.env.EMAIL_TARGET || 'tu_correo_de_compliance@ejemplo.com'; // El correo donde quieres recibir las denuncias
const FROM_EMAIL = import.meta.env.EMAIL_FROM || 'tu_correo_de_compliance@ejemplo.com'; // El correo donde quieres recibir las denuncias

const resend = new Resend(RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    // Manejar formularios con archivos adjuntos
    return handleMultipartForm(request);
  } else {
    // Manejar formularios sin archivos adjuntos (si eliminas el campo de archivo)
    return handleUrlEncodedForm(request);
  }
};

async function handleUrlEncodedForm(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();

    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = value;
      }
    }

    // Validación básica
    if (!data.detallesInfraccion || !data.incumplimientoAsociado || !data.tipoInfraccion) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Faltan campos requeridos en la sección de denuncia.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailBody = `
      <h1>Nuevo Reporte de Compliance</h1>
      <h2>Datos de la denuncia:</h2>
      <p><strong>Fecha:</strong> ${data.fecha || 'No especificado'}</p>
      <p><strong>Horario:</strong> ${data.horario || 'No especificado'}</p>
      <p><strong>Lugar del Incidente:</strong> ${data.lugarIncidente || 'No especificado'}</p>
      <p><strong>Incumplimiento Asociado:</strong> ${data.incumplimientoAsociado}</p>
      <p><strong>Tipo de Infracción:</strong> ${data.tipoInfraccion}</p>
      <p><strong>Colaboradores Involucrados:</strong> ${data.colaboradoresInvolucrados || 'No especificado'}</p>
      <p><strong>Identificación Involucrados:</strong> ${data.identificacionInvolucrados || 'No especificado'}</p>
      <p><strong>Detalles de la Infracción:</strong><br>${data.detallesInfraccion}</p>
      <p><strong>Periodo de los Hechos:</strong> ${data.periodoHechos || 'No especificado'}</p>
      <p><strong>Forma de Conocimiento:</strong> ${data.formaConocimiento || 'No especificado'}</p>

      <h2>Datos de Contacto (si proporcionados):</h2>
      <p><strong>Nombre:</strong> ${data.contactName || 'Anónimo'}</p>
      <p><strong>Correo Electrónico:</strong> ${data.contactEmail || 'No especificado'}</p>
      <p><strong>Teléfono:</strong> ${data.telefonoContacto || 'No especificado'}</p>
      <p><strong>Autoriza Confidencialidad:</strong> ${data.confidencialidad || 'No especificado'}</p>
    `;

    // Envío del correo electrónico
    if (RESEND_API_KEY && TARGET_EMAIL && FROM_EMAIL) {
      await resend.emails.send({
        from: FROM_EMAIL, // **¡IMPORTANTE! Usa un dominio verificado con Resend**
        to: TARGET_EMAIL,
        subject: `Nuevo Reporte de Compliance - ${data.tipoInfraccion}`,
        html: emailBody,
      });
      console.log('Correo de denuncia enviado con éxito.');
    } else {
      console.warn('Falta RESEND_API_KEY o COMPLIANCE_EMAIL_TARGET. No se envió el correo.');
      // En un entorno de producción, esto debería ser un error.
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: '¡Tu reporte ha sido enviado con éxito! Nos pondremos en contacto si proporcionaste tus datos.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al procesar el formulario (URL Encoded):', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Hubo un problema al enviar tu reporte. Por favor, inténtalo de nuevo más tarde.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleMultipartForm(request: Request): Promise<Response> {

  try {
    const formData = await request.formData(); // Astro/Netlify Adapter maneja multipart/form-data automáticamente aquí

    const data: Record<string, string | File> = {};
    const files: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = value;
      } else if (value instanceof File) {
        // Esto es un archivo
        files.push(value);
      }
    }

    // Validación similar a la anterior
    if (!data.detallesInfraccion || !data.incumplimientoAsociado || !data.tipoInfraccion) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Faltan campos requeridos en la sección de denuncia.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Preparar los adjuntos para Resend (si hay archivos)
    const attachments = files.length > 0 ? await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()), // Convertir el archivo a un Buffer
        // contentType: file.type // Resend a veces lo infiere, pero puedes especificarlo
      }))
    ) : undefined;

    const emailBody = `
      <h1>Nuevo Reporte de Compliance</h1>
      <h2>Datos de la denuncia:</h2>
      <p><strong>Fecha:</strong> ${data.fecha || 'No especificado'}</p>
      <p><strong>Horario:</strong> ${data.horario || 'No especificado'}</p>
      <p><strong>Lugar del Incidente:</strong> ${data.lugarIncidente || 'No especificado'}</p>
      <p><strong>Incumplimiento Asociado:</strong> ${data.incumplimientoAsociado}</p>
      <p><strong>Tipo de Infracción:</strong> ${data.tipoInfraccion}</p>
      <p><strong>Colaboradores Involucrados:</strong> ${data.colaboradoresInvolucrados || 'No especificado'}</p>
      <p><strong>Identificación Involucrados:</strong> ${data.identificacionInvolucrados || 'No especificado'}</p>
      <p><strong>Detalles de la Infracción:</strong><br>${data.detallesInfraccion}</p>
      <p><strong>Periodo de los Hechos:</strong> ${data.periodoHechos || 'No especificado'}</p>
      <p><strong>Forma de Conocimiento:</strong> ${data.formaConocimiento || 'No especificado'}</p>
      <p><strong>Archivos Adjuntos:</strong> ${files.map(f => f.name).join(', ') || 'Ninguno'}</p>

      <h2>Datos de Contacto (si proporcionados):</h2>
      <p><strong>Nombre:</strong> ${data.contactName || 'Anónimo'}</p>
      <p><strong>Correo Electrónico:</strong> ${data.contactEmail || 'No especificado'}</p>
      <p><strong>Teléfono:</strong> ${data.telefonoContacto || 'No especificado'}</p>
      <p><strong>Autoriza Confidencialidad:</strong> ${data.confidencialidad || 'No especificado'}</p>
    `;

    // Envío del correo electrónico con adjuntos
    if (RESEND_API_KEY && TARGET_EMAIL && FROM_EMAIL) {
      await resend.emails.send({
        from: FROM_EMAIL, // **¡IMPORTANTE! Usa un dominio verificado con Resend**
        to: TARGET_EMAIL,
        subject: `Nuevo Reporte de Compliance (con adjuntos) - ${data.tipoInfraccion}`,
        html: emailBody,
        attachments: attachments, // Adjunta los archivos
      });
      console.log('Correo de denuncia con adjuntos enviado con éxito.');
    } else {
      console.warn('Falta RESEND_API_KEY o COMPLIANCE_EMAIL_TARGET. No se envió el correo con adjuntos.');
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: '¡Tu reporte ha sido enviado con éxito! Nos pondremos en contacto si proporcionaste tus datos.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al procesar el formulario (Multipart):', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Hubo un problema al enviar tu reporte con adjuntos. Por favor, inténtalo de nuevo más tarde.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
