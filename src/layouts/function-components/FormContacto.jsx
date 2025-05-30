// src/components/ContactForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactoSchema } from '@/schemas/contactoSchema'; // Asegúrate de que esta ruta sea correcta para tu proyecto Astro

const ContactForm = () => {
  // Estado para manejar los mensajes de éxito/error del formulario en la UI
  const [formMessage, setFormMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields }, // 'touchedFields' para borde verde, 'errors' para borde rojo
    reset, // Para limpiar el formulario después de un envío exitoso
  } = useForm({
    resolver: zodResolver(contactoSchema), // Integra Zod para la validación del esquema
    mode: 'all', // Valida en cada cambio (onChange) y al perder el foco (onBlur)
  });

  // Función que se ejecuta cuando el formulario es válido y se intenta enviar
  const onSubmit = async (data) => {
    setFormMessage(null); // Limpia cualquier mensaje anterior al iniciar un nuevo envío

    console.log("Datos del formulario validados por Zod:", data);

    const formData = new FormData();
    // Añade cada campo del objeto 'data' a FormData
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        formData.append(key, data[key]);
      }
    }

    // Campos específicos para Netlify (honeypot y form-name)
    // Son importantes si usas Netlify's built-in forms o si tu API los procesa.
    // formData.append("bot-field", data["bot-field"] || ""); // Campo honeypot anti-spam
    // formData.append("form-name", "contact"); // Nombre del formulario para Netlify

    try {
      // Envía el formulario a tu endpoint API de Astro
      const response = await fetch("/api/functions/contacto", {
        method: "POST",
        body: formData, // FormData maneja automáticamente el 'Content-Type: multipart/form-data'
      });

      if (response.ok) {
        // Si la respuesta es exitosa (código 2xx)
        setFormMessage({ type: 'success', text: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.' });
        reset(); // Limpia todos los campos del formulario
      } else {
        // Si la respuesta indica un error del servidor (código 4xx o 5xx)
        let errorMessage = `Hubo un problema al enviar tu mensaje: ${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json(); // Intenta parsear la respuesta como JSON
          errorMessage = errorData.message || errorMessage; // Usa el mensaje del servidor si está disponible
        } catch (jsonError) {
          // Si la respuesta no es JSON, usa el mensaje de error HTTP predeterminado
          console.error("Error al parsear la respuesta de error como JSON:", jsonError);
        }
        setFormMessage({
          type: 'error',
          text: errorMessage
        });
      }
    } catch (error) {
      // Si hay un error en la conexión o en la solicitud fetch
      console.error("Error de conexión al enviar el formulario:", error);
      setFormMessage({ type: 'error', text: 'Error de conexión. Por favor, revisa tu conexión a internet.' });
    }
  };

  // Función auxiliar para determinar las clases de borde de los inputs
  const getBorderClasses = (fieldName) => {
    // Si hay un error de validación para el campo, el borde es rojo
    if (errors[fieldName]) {
      return 'border-red-500';
    }
    // Si el campo ha sido tocado (interactuado) y no tiene errores, el borde es verde
    if (touchedFields[fieldName]) {
      return 'border-green-500';
    }
    // Por defecto (si no ha sido tocado y no tiene errores), el borde es gris
    return 'border-gray-300';
  };

  const onInvalid = (errors) => {
    console.error("Errores de validación:", errors);
    setFormMessage({
      type: 'error',
      text: 'Por favor, corrige los errores en el formulario antes de enviar.'
    });
  };
  return (
    <form
      className="lg:mx-4 mx-auto"
      onSubmit={handleSubmit(onSubmit)} // Maneja el envío del formulario con react-hook-form
      // name="contact" // Atributo 'name' para Netlify Forms
      // netlify-honeypot="bot-field" // Atributo honeypot para Netlify Forms
      // data-netlify="true" // Atributo para que Netlify detecte el formulario (aunque uses JS para enviar)
    >
      {/* Sección para mostrar los mensajes de éxito o error del formulario */}
      {formMessage && (
        <div
          className={`p-3 mb-4 rounded-md text-center ${
            formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
          role="alert" // Atributo ARIA para accesibilidad
        >
          {formMessage.text}
        </div>
      )}
      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

      {/* Campo oculto para el honeypot de Netlify (protección anti-spam) */}
      {/* <p className="hidden">
        <label>
          Don’t fill this out if you’re human: <input name="bot-field" {...register("bot-field")} />
        </label>
      </p> */}

      {/* Campo de Nombre completo */}
      <div className="form-group mb-5">
        <label className="form-label" htmlFor="name">Nombre completo</label>
        <input
          className={`form-control border ${getBorderClasses('name')}`} // Aplica clases de borde dinámicas
          type="text"
          id="name"
          placeholder="Ingrese su nombre completo"
          {...register("name")} // Registra el input con react-hook-form
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>} {/* Muestra el error si existe */}
      </div>

      {/* Campo de Correo electrónico */}
      <div className="form-group mb-5">
        <label className="form-label" htmlFor="email">Correo electrónico</label>
        <input
          className={`form-control border ${getBorderClasses('email')}`}
          type="text"
          id="email"
          placeholder="Ingrese su correo electrónico"
          {...register("email")}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Campo de Asunto */}
      <div className="form-group mb-5">
        <label className="form-label" htmlFor="asunto">Asunto</label>
        <input
          className={`form-control border ${getBorderClasses('asunto')}`}
          type="text"
          id="asunto"
          placeholder="Asunto"
          {...register("asunto")}
        />
        {errors.asunto && <p className="text-red-500 text-sm mt-1">{errors.asunto.message}</p>}
      </div>

      {/* Campo de Mensaje */}
      <div className="form-group mb-5">
        <label className="form-label" htmlFor="message">Mensaje</label>
        <textarea
          className={`form-control border ${getBorderClasses('message')}`}
          id="message"
          cols="30"
          rows="6"
          placeholder="Escribe tu mensaje aquí..."
          {...register("message")}
        ></textarea>
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>

      {/* Botón de envío del formulario */}
      <button
        className="btn btn-primary block w-full"
        type="submit"
      >
        Enviar Mensaje
      </button>
    </form>
  );
};

export default ContactForm;
