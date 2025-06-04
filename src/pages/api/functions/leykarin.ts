import type { APIRoute } from 'astro';
import { leyKarinSchema } from '@/schemas/ley-karin/leyKarinSchema';
import { Resend } from 'resend';

// Variables de entorno
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const TARGET_EMAIL = import.meta.env.EMAIL_TARGET;
const FROM_EMAIL = import.meta.env.EMAIL_FROM;

// Instancia de Resend
const resend = new Resend(RESEND_API_KEY);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const formData = await request.json();

    // Validar el formulario usando el schema de Zod
    const validationResult = leyKarinSchema.safeParse(formData);

    if (!validationResult.success) {
      // Formatear los errores de validación
      const fieldErrors: { [key: string]: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          fieldErrors[err.path.join('.')] = err.message;
        }
      });

      console.error('Error de validación del formulario:', validationResult.error.errors);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Hay errores en los datos proporcionados. Por favor, revise el formulario.',
        errors: fieldErrors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = validationResult.data;
    const submissionTimestamp = new Date().toISOString();

    // Enviar correo electrónico
    if (!RESEND_API_KEY || !TARGET_EMAIL || !FROM_EMAIL) {
      console.error('Faltan variables de entorno cruciales para Resend. No se puede enviar el email.');
    } else {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: TARGET_EMAIL,
          subject: `Nueva Denuncia Ley Karin - ${data.denunciante.nombres_apellidos_denunciante}`,
          html: `
            <h1>Nueva Denuncia Ley Karin</h1>
            <p><strong>Fecha y Hora del Reporte:</strong> ${new Date().toLocaleString('es-CL')}</p>

            <h2>Datos del Denunciante:</h2>
            <p><strong>Asunto:</strong> ${data.denunciante.asunto_denunciante}</p>
            <p><strong>Nombres y Apellidos:</strong> ${data.denunciante.nombres_apellidos_denunciante}</p>
            <p><strong>RUT:</strong> ${data.denunciante.rut_denunciante}</p>
            <p><strong>Cargo:</strong> ${data.denunciante.cargo_denunciante}</p>
            <p><strong>Área:</strong> ${data.denunciante.area_denunciante}</p>
            <p><strong>Email:</strong> ${data.denunciante.email_denunciante}</p>
            <p><strong>Teléfono:</strong> ${data.denunciante.telefono_contacto_denunciante}</p>
            <p><strong>¿Es la víctima?:</strong> ${data.denunciante.quien_realiza_denuncia === 'si' ? 'Sí' : 'No'}</p>

            ${data.denunciante.quien_realiza_denuncia === 'no' ? `
            <h2>Datos del Representante:</h2>
            <p><strong>Nombres y Apellidos:</strong> ${data.representante.nombres_apellidos_representante}</p>
            <p><strong>RUT:</strong> ${data.representante.rut_representante}</p>
            <p><strong>Cargo:</strong> ${data.representante.cargo_representante}</p>
            <p><strong>Área:</strong> ${data.representante.area_representante}</p>
            <p><strong>Email:</strong> ${data.representante.email_representante}</p>
            <p><strong>Teléfono:</strong> ${data.representante.telefono_contacto_representante}</p>
            ` : ''}

            <h2>Datos del Denunciado:</h2>
            <p><strong>Nombres y Apellidos:</strong> ${data.denunciado.nombres_apellidos_denunciado}</p>
            <p><strong>RUT:</strong> ${data.denunciado.rut_denunciado}</p>
            <p><strong>Cargo:</strong> ${data.denunciado.cargo_denunciado}</p>
            <p><strong>Área:</strong> ${data.denunciado.area_denunciado}</p>

            <h2>Antecedentes de la Denuncia:</h2>
            <p><strong>Tipo de Denuncia:</strong> ${data.antecedentes_denuncia.tipo_situacion}</p>
            ${data.antecedentes_denuncia.relacion_victima_denunciado ? `
            <p><strong>Relación entre Víctima y Denunciado:</strong><br>${data.antecedentes_denuncia.relacion_victima_denunciado.join(', ')}</p>
            ` : ''}
            ${data.antecedentes_denuncia.presuntas_situaciones ? `
            <p><strong>Presuntas Situaciones Denunciadas:</strong><br>${data.antecedentes_denuncia.presuntas_situaciones.join(', ')}</p>
            ` : ''}

            <h2>Testigos:</h2>
            ${data.testigos.descripcion ? `
            <p><strong>Información de Testigos:</strong><br>${data.testigos.descripcion.replace(/\n/g, '<br>')}</p>
            ` : '<p>No se proporcionó información de testigos.</p>'}

            <h2>Relato de la Denuncia:</h2>
            <p><strong>Hoja 1:</strong><br>${data.relato_denuncia.hoja1.replace(/\n/g, '<br>')}</p>
            ${data.relato_denuncia.hoja2 ? `
            <p><strong>Hoja 2:</strong><br>${data.relato_denuncia.hoja2.replace(/\n/g, '<br>')}</p>
            ` : ''}

            <h2>Documentos de Respaldo:</h2>
            ${data.documentos_respaldo.url_dadoPorUsuario_2 || data.documentos_respaldo.url_dadoPorUsuario_3 ? `
            ${data.documentos_respaldo.url_dadoPorUsuario_2 ? `
            <p><strong>URL de Documento 1:</strong> <a href="${data.documentos_respaldo.url_dadoPorUsuario_2}" target="_blank">${data.documentos_respaldo.url_dadoPorUsuario_2}</a></p>
            ` : ''}
            ${data.documentos_respaldo.url_dadoPorUsuario_3 ? `
            <p><strong>URL de Documento 2:</strong> <a href="${data.documentos_respaldo.url_dadoPorUsuario_3}" target="_blank">${data.documentos_respaldo.url_dadoPorUsuario_3}</a></p>
            ` : ''}
            ` : '<p>No se proporcionaron URLs de documentos de respaldo.</p>'}

            <hr>
            <small>Este correo fue generado automáticamente por el canal de denuncias. IP del remitente: ${clientAddress || 'N/A'}</small>
          `
        });
        console.log('Correo de denuncia enviado con éxito.');
      } catch (emailError) {
        console.error('Error al enviar el correo con Resend:', emailError);
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: '¡Tu denuncia ha sido enviada con éxito! Agradecemos tu valiosa colaboración. Pronto enviaremos la confirmación de recepción a su correo o medio de contacto.',
      data: {
        ...data,
        fecha: submissionTimestamp
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error general al procesar el formulario:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Hubo un problema inesperado al enviar tu denuncia. Por favor, inténtalo de nuevo más tarde.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
