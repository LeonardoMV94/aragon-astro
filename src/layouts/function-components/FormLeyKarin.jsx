import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leyKarinSchema } from "@/schemas/ley-karin/leyKarinSchema";
import CollapsibleSection from "./CollapsibleSection";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FormLeyKarin = () => {
  const [formMessage, setFormMessage] = useState(null);
  const [charCounts, setCharCounts] = useState({
    testigos: 0,
    relato1: 0,
    relato2: 0,
  });

  const messageRef = useRef(null);
  const denuncianteRef = useRef(null);
  const representanteRef = useRef(null);
  const denunciadoRef = useRef(null);
  const antecedentesRef = useRef(null);
  const testigosRef = useRef(null);
  const relatoRef = useRef(null);
  const documentosRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(leyKarinSchema),
    mode: "onChange",
  });

  // Observar campos para validación condicional
  const esVictima = watch("denunciante.quien_realiza_denuncia") === "Sí";

  // Contadores de caracteres
  const handleTextareaChange = (field, maxLength) => (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setValue(field, value);
      setCharCounts((prev) => ({
        ...prev,
        [field.split(".").pop()]: value.length,
      }));
    }
  };

  const onSubmit = async (data) => {
    setFormMessage(null);

    try {
      const response = await fetch("/api/functions/leykarin", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setFormMessage({
          type: "success",
          text: "¡Denuncia enviada con éxito! Nos pondremos en contacto contigo pronto.",
        });
        reset();
        messageRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        const errorData = await response.json();
        setFormMessage({
          type: "error",
          text: errorData.message || "Error al enviar el formulario",
        });
        messageRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      setFormMessage({
        type: "error",
        text: "Error de conexión. Por favor intenta nuevamente.",
      });
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onInvalid = (errors) => {
    // Función recursiva para obtener todos los errores anidados
    const getNestedErrors = (errors, prefix = '') => {
      return Object.entries(errors).flatMap(([key, value]) => {
        const fieldName = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && 'message' in value) {
          // Es un error directo
          return [`${fieldName}: ${value.message}`];
        } else if (value && typeof value === 'object') {
          // Es un objeto anidado, procesar recursivamente
          return getNestedErrors(value, fieldName);
        }
        return [];
      });
    };

    const fieldErrors = getNestedErrors(errors).join('\n');

    setFormMessage({
      type: "error",
      text: `Por favor, corrija los siguientes errores:\n${fieldErrors}`
    });
  };

  // Estilo para campos con error
  const getFieldClass = (fieldName) => {
    const fieldErrors = fieldName
      .split(".")
      .reduce((obj, key) => obj?.[key], errors);
    return `form-control w-full p-3 border rounded-md ${fieldErrors ? "border-red-500" : "border-gray-300"}`;
  };

  const generatePDF = async () => {
    try {
      // Validar el formulario antes de generar el PDF
      const formElement = document.querySelector('form');
      if (!formElement) {
        throw new Error('No se encontró el formulario');
      }

      const formData = new FormData(formElement);
      const formValues = {};
      for (let [key, value] of formData.entries()) {
        formValues[key] = value;
      }

      const validationResult = leyKarinSchema.safeParse(formValues);

      if (!validationResult.success) {
        // Mapear los errores de Zod a un formato más amigable
        const fieldErrors = validationResult.error.errors.map(err => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        }).join('\n');

        setFormMessage({
          type: 'error',
          text: `Por favor, corrija los siguientes errores:\n${fieldErrors}`
        });
        return;
      }

      // Crear un nuevo PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Configurar el PDF
      pdf.setFont('helvetica');
      pdf.setFontSize(16);
      pdf.text('Denuncia Ley Karin', 105, 20, { align: 'center' });

      // Agregar fecha y hora
      pdf.setFontSize(12);
      const now = new Date();
      pdf.text(`Fecha de generación: ${now.toLocaleString('es-CL')}`, 105, 30, { align: 'center' });

      // Agregar datos del denunciante
      pdf.setFontSize(14);
      pdf.text('DATOS DEL DENUNCIANTE', 20, 45);
      pdf.setFontSize(12);

      let yPosition = 55;
      const lineHeight = 8;

      // Función auxiliar para agregar texto con manejo de saltos de línea
      const addText = (text, y) => {
        const splitText = pdf.splitTextToSize(text, 170);
        pdf.text(splitText, 20, y);
        return y + (splitText.length * lineHeight);
      };

      // Datos del denunciante
      yPosition = addText(`Asunto: ${formValues['denunciante.asunto_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Nombres y Apellidos: ${formValues['denunciante.nombres_apellidos_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`RUT: ${formValues['denunciante.rut_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Cargo: ${formValues['denunciante.cargo_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Área: ${formValues['denunciante.area_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Email: ${formValues['denunciante.email_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Teléfono: ${formValues['denunciante.telefono_contacto_denunciante'] || 'No especificado'}`, yPosition);
      yPosition = addText(`¿Es la víctima?: ${formValues['denunciante.quien_realiza_denuncia'] === 'si' ? 'Sí' : 'No'}`, yPosition);

      // Si no es la víctima, agregar datos del representante
      if (formValues['denunciante.quien_realiza_denuncia'] === 'no') {
        yPosition += lineHeight;
        pdf.setFontSize(14);
        pdf.text('DATOS DEL REPRESENTANTE', 20, yPosition);
        yPosition += lineHeight;
        pdf.setFontSize(12);

        yPosition = addText(`Nombres y Apellidos: ${formValues['representante.nombres_apellidos_representante'] || 'No especificado'}`, yPosition);
        yPosition = addText(`RUT: ${formValues['representante.rut_representante'] || 'No especificado'}`, yPosition);
        yPosition = addText(`Cargo: ${formValues['representante.cargo_representante'] || 'No especificado'}`, yPosition);
        yPosition = addText(`Área: ${formValues['representante.area_representante'] || 'No especificado'}`, yPosition);
        yPosition = addText(`Email: ${formValues['representante.email_representante'] || 'No especificado'}`, yPosition);
        yPosition = addText(`Teléfono: ${formValues['representante.telefono_contacto_representante'] || 'No especificado'}`, yPosition);
      }

      // Datos del denunciado
      yPosition += lineHeight;
      pdf.setFontSize(14);
      pdf.text('DATOS DEL DENUNCIADO', 20, yPosition);
      yPosition += lineHeight;
      pdf.setFontSize(12);

      yPosition = addText(`Nombres y Apellidos: ${formValues['denunciado.nombres_apellidos_denunciado'] || 'No especificado'}`, yPosition);
      yPosition = addText(`RUT: ${formValues['denunciado.rut_denunciado'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Cargo: ${formValues['denunciado.cargo_denunciado'] || 'No especificado'}`, yPosition);
      yPosition = addText(`Área: ${formValues['denunciado.area_denunciado'] || 'No especificado'}`, yPosition);

      // Antecedentes de la denuncia
      yPosition += lineHeight;
      pdf.setFontSize(14);
      pdf.text('ANTECEDENTES DE LA DENUNCIA', 20, yPosition);
      yPosition += lineHeight;
      pdf.setFontSize(12);

      yPosition = addText(`Tipo de Situación: ${formValues['antecedentes_denuncia.tipo_situacion'] || 'No especificado'}`, yPosition);

      // Relato de la denuncia
      yPosition += lineHeight;
      pdf.setFontSize(14);
      pdf.text('RELATO DE LA DENUNCIA', 20, yPosition);
      yPosition += lineHeight;
      pdf.setFontSize(12);

      yPosition = addText(`Hoja 1: ${formValues['relato_denuncia.hoja1'] || 'No especificado'}`, yPosition);
      if (formValues['relato_denuncia.hoja2']) {
        yPosition = addText(`Hoja 2: ${formValues['relato_denuncia.hoja2']}`, yPosition);
      }

      // Documentos de respaldo
      yPosition += lineHeight;
      pdf.setFontSize(14);
      pdf.text('DOCUMENTOS DE RESPALDO', 20, yPosition);
      yPosition += lineHeight;
      pdf.setFontSize(12);

      if (formValues['documentos_respaldo.url_dadoPorUsuario_2']) {
        yPosition = addText(`URL Documento 1: ${formValues['documentos_respaldo.url_dadoPorUsuario_2']}`, yPosition);
      }
      if (formValues['documentos_respaldo.url_dadoPorUsuario_3']) {
        yPosition = addText(`URL Documento 2: ${formValues['documentos_respaldo.url_dadoPorUsuario_3']}`, yPosition);
      }

      // Guardar el PDF
      pdf.save('denuncia-ley-karin.pdf');

      setFormMessage({
        type: 'success',
        text: 'PDF generado con éxito'
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setFormMessage({
        type: 'error',
        text: 'Error al generar el PDF. Por favor, intente nuevamente.'
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="lg:mx-4 mx-auto"
      noValidate
    >
      <input type="hidden" name="formulario_enviado" value="1" />

      {/* Mensaje de estado del formulario */}
      <div ref={messageRef}>
        {formMessage && (
          <div
            className={`p-3 mb-4 rounded-md text-center ${
              formMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            role="alert"
            aria-live="assertive"
          >
            {formMessage.text}
          </div>
        )}
      </div>

      {/* SECCIÓN DENUNCIANTE */}
      <CollapsibleSection
        ref={denuncianteRef}
        title="DATOS DEL DENUNCIANTE"
        defaultOpen
      >
        <div className="grid md:grid-cols-2 md:gap-x-6">
          <div className="col-span-full">
            <p className="mb-2">
              Toda la información entregada en este formulario será tratada y
              administrada en extrema confidencialidad, tanto sus datos como los
              de terceros, sólo serán utilizados para efectos de comunicación
              con usted, las partes involucradas y el proceso de investigación
              que corresponda.
            </p>
            <p className="mb-4">
              <strong className="text-red-500">(*) Campos Obligatorios</strong>
            </p>
          </div>

          <div>
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="asunto_denunciante">
                Asunto (*) | Máximo 85 caracteres.
              </label>
              <input
                type="text"
                id="asunto_denunciante"
                maxLength={85}
                placeholder="Ejemplo: Denuncia sobre abuso sexual en area de recursos humanos"
                className={getFieldClass("denunciante.asunto_denunciante")}
                {...register("denunciante.asunto_denunciante")}
              />
              {errors.denunciante?.asunto_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.asunto_denunciante.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label
                className="form-label"
                htmlFor="nombres_apellidos_denunciante"
              >
                Nombres y Apellidos (*) | Máximo 50 caracteres.
              </label>
              <input
                type="text"
                id="nombres_apellidos_denunciante"
                maxLength={50}
                className={getFieldClass(
                  "denunciante.nombres_apellidos_denunciante",
                )}
                {...register("denunciante.nombres_apellidos_denunciante")}
              />
              {errors.denunciante?.nombres_apellidos_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.nombres_apellidos_denunciante.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label className="form-label" htmlFor="rut_denunciante">
                RUT (*) | Con guión y digito verificador, Máximo 12 caracteres.
              </label>
              <input
                type="text"
                id="rut_denunciante"
                maxLength={12}
                placeholder="16618865-2"
                className={getFieldClass("denunciante.rut_denunciante")}
                {...register("denunciante.rut_denunciante")}
              />
              {errors.denunciante?.rut_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.rut_denunciante.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label className="form-label" htmlFor="cargo_denunciante">
                Cargo (*) | Máximo 50 caracteres.
              </label>
              <input
                type="text"
                id="cargo_denunciante"
                maxLength={50}
                className={getFieldClass("denunciante.cargo_denunciante")}
                {...register("denunciante.cargo_denunciante")}
              />
              {errors.denunciante?.cargo_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.cargo_denunciante.message}
                </span>
              )}
            </div>


          </div>

          <div>
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="email_denunciante">
                Email (*)
              </label>
              <input
                type="email"
                id="email_denunciante"
                className={getFieldClass("denunciante.email_denunciante")}
                {...register("denunciante.email_denunciante")}
              />
              {errors.denunciante?.email_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.email_denunciante.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label
                className="form-label"
                htmlFor="telefono_contacto_denunciante"
              >
                Teléfono de Contacto (*) | Máximo 15 caracteres.
              </label>
              <input
                type="text"
                id="telefono_contacto_denunciante"
                maxLength={15}
                className={getFieldClass(
                  "denunciante.telefono_contacto_denunciante",
                )}
                {...register("denunciante.telefono_contacto_denunciante")}
              />
              {errors.denunciante?.telefono_contacto_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.telefono_contacto_denunciante.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <fieldset className="mb-2">
                <legend className="form-label">
                  ¿Es usted la víctima de los hechos denunciados? (*)
                </legend>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="si"
                      className="form-radio h-4 w-4 text-[#f09300] focus:ring-[#f09300]"
                      {...register("denunciante.quien_realiza_denuncia", {
                        required: "Este campo es obligatorio",
                      })}
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="no"
                      className="form-radio h-4 w-4 text-[#f09300] focus:ring-[#f09300]"
                      {...register("denunciante.quien_realiza_denuncia")}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
                {errors.denunciante?.quien_realiza_denuncia && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.denunciante.quien_realiza_denuncia.message}
                  </span>
                )}
              </fieldset>
            </div>
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="area_denunciante">
                Gerencia, departamento o área donde trabaja (*) | Máximo 60
                caracteres.
              </label>
              <input
                type="text"
                id="area_denunciante"
                maxLength={60}
                placeholder="Ejemplo, Área de Recursos Humanos"
                className={getFieldClass("denunciante.area_denunciante")}
                {...register("denunciante.area_denunciante")}
              />
              {errors.denunciante?.area_denunciante && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciante.area_denunciante.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* SECCIÓN REPRESENTANTE (condicional) */}
      {!esVictima && (
        <CollapsibleSection
          ref={representanteRef}
          title="DATOS DEL REPRESENTANTE"
        >
          <div className="grid md:grid-cols-2 md:gap-x-6">
            <div className="col-span-full">
              <p className="mb-4">
                <strong>
                  Sólo en el caso de estar representando a la presunta víctima
                  de la denuncia
                </strong>
                , debe ingresar a continuación, su información personal.
              </p>
            </div>

            <div>
              <div className="form-group mb-5">
                <label
                  className="form-label"
                  htmlFor="nombres_apellidos_representante"
                >
                  Nombres y Apellidos | Máximo 85 caracteres
                </label>
                <input
                  type="text"
                  id="nombres_apellidos_representante"
                  maxLength={85}
                  className={getFieldClass(
                    "representante.nombres_apellidos_representante",
                  )}
                  {...register("representante.nombres_apellidos_representante")}
                />
                {errors.representante?.nombres_apellidos_representante && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {
                      errors.representante.nombres_apellidos_representante
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="form-group mb-5">
                <label className="form-label" htmlFor="rut_representante">
                  RUT del Representante | Máximo 12 Caracteres
                </label>
                <input
                  type="text"
                  id="rut_representante"
                  maxLength={12}
                  placeholder="Ejemplo: 12987123-3"
                  className={getFieldClass("representante.rut_representante")}
                  {...register("representante.rut_representante")}
                />
                {errors.representante?.rut_representante && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.representante.rut_representante.message}
                  </span>
                )}
              </div>

              <div className="form-group mb-5">
                <label className="form-label" htmlFor="cargo_representante">
                  Cargo | Máximo 50 Caracteres
                </label>
                <input
                  type="text"
                  id="cargo_representante"
                  maxLength={50}
                  className={getFieldClass("representante.cargo_representante")}
                  {...register("representante.cargo_representante")}
                />
                {errors.representante?.cargo_representante && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.representante.cargo_representante.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="form-group mb-5">
                <label className="form-label" htmlFor="area_representante">
                  Gerencia, departamento o área donde trabaja | Máximo 60
                  Caracteres
                </label>
                <input
                  type="text"
                  id="area_representante"
                  maxLength={60}
                  placeholder="Ejemplo, Área de Recursos Humanos"
                  className={getFieldClass("representante.area_representante")}
                  {...register("representante.area_representante")}
                />
                {errors.representante?.area_representante && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.representante.area_representante.message}
                  </span>
                )}
              </div>

              <div className="form-group mb-5">
                <label className="form-label" htmlFor="email_representante">
                  Email
                </label>
                <input
                  type="email"
                  id="email_representante"
                  className={getFieldClass("representante.email_representante")}
                  {...register("representante.email_representante")}
                />
                {errors.representante?.email_representante && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.representante.email_representante.message}
                  </span>
                )}
              </div>

              <div className="form-group mb-5">
                <label
                  className="form-label"
                  htmlFor="telefono_contacto_representante"
                >
                  Teléfono de Contacto | Máximo 12 Caracteres
                </label>
                <input
                  type="text"
                  id="telefono_contacto_representante"
                  maxLength={12}
                  className={getFieldClass(
                    "representante.telefono_contacto_representante",
                  )}
                  {...register("representante.telefono_contacto_representante")}
                />
                {errors.representante?.telefono_contacto_representante && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {
                      errors.representante.telefono_contacto_representante
                        .message
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* SECCIÓN DENUNCIADO */}
      <CollapsibleSection ref={denunciadoRef} title="DATOS DEL DENUNCIADO (A)">
        <div className="grid md:grid-cols-2 md:gap-x-6">
          <div className="col-span-full">
            <p className="mb-4">
              <strong className="text-red-500">(*) Campos Obligatorios</strong>
            </p>
          </div>

          <div>
            <div className="form-group mb-5">
              <label
                className="form-label"
                htmlFor="nombres_apellidos_denunciado"
              >
                Nombres y Apellidos (*) | Máximo 85 caracteres
              </label>
              <input
                type="text"
                id="nombres_apellidos_denunciado"
                maxLength={85}
                className={getFieldClass(
                  "denunciado.nombres_apellidos_denunciado",
                )}
                {...register("denunciado.nombres_apellidos_denunciado")}
              />
              {errors.denunciado?.nombres_apellidos_denunciado && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciado.nombres_apellidos_denunciado.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label className="form-label" htmlFor="rut_denunciado">
                RUT | Máximo 12 Caracteres
              </label>
              <input
                type="text"
                id="rut_denunciado"
                maxLength={12}
                className={getFieldClass("denunciado.rut_denunciado")}
                {...register("denunciado.rut_denunciado")}
              />
              {errors.denunciado?.rut_denunciado && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciado.rut_denunciado.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="form-group mb-5">
              <label className="form-label" htmlFor="cargo_denunciado">
                Cargo | Máximo 50 caracteres
              </label>
              <input
                type="text"
                id="cargo_denunciado"
                maxLength={50}
                className={getFieldClass("denunciado.cargo_denunciado")}
                {...register("denunciado.cargo_denunciado")}
              />
              {errors.denunciado?.cargo_denunciado && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciado.cargo_denunciado.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label className="form-label" htmlFor="area_denunciado">
                Gerencia, departamento o área donde trabaja | Máximo 60
                caracteres
              </label>
              <input
                type="text"
                id="area_denunciado"
                maxLength={60}
                placeholder="Ejemplo, Área de Recursos Humanos"
                className={getFieldClass("denunciado.area_denunciado")}
                {...register("denunciado.area_denunciado")}
              />
              {errors.denunciado?.area_denunciado && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.denunciado.area_denunciado.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* SECCIÓN ANTECEDENTES */}
      <CollapsibleSection
        ref={antecedentesRef}
        title="ANTECEDENTES ESPECÍFICOS DE LA DENUNCIA"
      >
        <div className="grid grid-cols-1 md:gap-x-6">
          <div className="col-span-full">
            <p className="mb-4">
              <strong className="text-red-500">(*) Campos Obligatorios</strong>
            </p>
          </div>

          <div className="col-span-full form-group mb-5">
            <fieldset className="mb-4">
              <legend className="form-label">
                ¿Qué situaciones se denuncian? (*)
              </legend>
              <div className="flex flex-wrap gap-x-4">
                <label className="inline-flex items-center mb-2">
                  <input
                    type="radio"
                    value="acoso_laboral"
                    className="form-radio h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.tipo_situacion")}
                  />
                  <span className="ml-2">Acoso Laboral</span>
                </label>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="radio"
                    value="acoso_sexual"
                    className="form-radio h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.tipo_situacion")}
                  />
                  <span className="ml-2">Acoso Sexual</span>
                </label>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="radio"
                    value="maltrato_laboral"
                    className="form-radio h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.tipo_situacion")}
                  />
                  <span className="ml-2">Maltrato Laboral</span>
                </label>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="radio"
                    value="otra_situacion_violencia_laboral"
                    className="form-radio h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.tipo_situacion")}
                  />
                  <span className="ml-2">
                    Otra Situación de Violencia Laboral
                  </span>
                </label>
              </div>
              {errors.antecedentes_denuncia?.tipo_situacion && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.antecedentes_denuncia.tipo_situacion.message}
                </span>
              )}
            </fieldset>

            <fieldset className="mb-4">
              <legend className="form-label">
                Sobre la relación entre la víctima y el denunciado (marque las
                que correspondan)
              </legend>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register(
                      "antecedentes_denuncia.relacion_victima_denunciado",
                    )}
                    value="relacion_asimetrica_victima_depende"
                  />
                  <span className="ml-2">
                    Existe una relación asimétrica en que la víctima tiene
                    dependencia directa o indirecta de el/la denunciado(a)
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register(
                      "antecedentes_denuncia.relacion_victima_denunciado",
                    )}
                    value="relacion_asimetrica_denunciado_depende"
                  />
                  <span className="ml-2">
                    Existe una relación asimétrica en que el/la denunciado(a)
                    tiene dependencia directa o indirecta de la víctima.
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register(
                      "antecedentes_denuncia.relacion_victima_denunciado",
                    )}
                    value="relacion_simetrica_misma_area"
                  />
                  <span className="ml-2">
                    Existe una relación simétrica en que el denunciado(a) y la
                    víctima no tiene una dependencia directa ni indirecta, pero
                    se desempeñan en la misma área o equipo.
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register(
                      "antecedentes_denuncia.relacion_victima_denunciado",
                    )}
                    value="relacion_simetrica_distinta_area"
                  />
                  <span className="ml-2">
                    Existe una relación simétrica en que el denunciado(a) y la
                    víctima no tiene una dependencia directa ni indirecta, y no
                    se desempeñan en la misma área o equipo.
                  </span>
                </label>
              </div>
            </fieldset>

            <fieldset className="mb-4">
              <legend className="form-label">
                Sobre las presuntas situaciones denunciadas (marque las que
                correspondan)
              </legend>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.presuntas_situaciones")}
                    value="existe_evidencia"
                  />
                  <span className="ml-2">
                    Existe evidencia de lo denunciado (correos electrónicos,
                    fotos, etc.)
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.presuntas_situaciones")}
                    value="existe_conocimiento_antecedentes"
                  />
                  <span className="ml-2">
                    Existe conocimiento de otros antecedentes de índole similar.
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.presuntas_situaciones")}
                    value="informado_previamente"
                  />
                  <span className="ml-2">
                    La situación denunciada fue informada previamente en otra
                    instancia similar (Jefatura, supervisor, mediación laboral,
                    etc.)
                  </span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-[#f09300]"
                    {...register("antecedentes_denuncia.presuntas_situaciones")}
                    value="ninguna_anterior"
                  />
                  <span className="ml-2">Ninguna de las anteriores.</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      </CollapsibleSection>

      {/* SECCIÓN TESTIGOS */}
      <CollapsibleSection ref={testigosRef} title="EN CASO DE EXISTIR TESTIGOS">
        <div className="grid grid-cols-1 md:gap-x-6">
          <div className="col-span-full">
            <p className="mb-2">
              Escriba sus nombres, correos electrónicos y/o teléfonos si los
              tiene disponibles. | Máximo 1000 caracteres
            </p>
            <div className="contador mb-2">
              {charCounts.testigos} / 1000 caracteres
            </div>
            <textarea
              id="testigos.descripcion"
              rows={4}
              maxLength={1000}
              className={getFieldClass("testigos.descripcion")}
              {...register("testigos.descripcion")}
              onChange={handleTextareaChange("testigos.descripcion", 1000)}
            />
            {errors.testigos?.descripcion && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.testigos.descripcion.message}
              </span>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* SECCIÓN RELATO */}
      <CollapsibleSection
        ref={relatoRef}
        title="RELATO DE LA SITUACIÓN DENUNCIADA"
      >
        <div className="grid grid-cols-1 md:gap-x-6">
          <div className="col-span-full">
            <p className="mb-2">
              Escriba un relato de la situación que quiere denunciar, indique
              fechas, horas, lugares y toda la información que considere
              importante para conocer el caso y pueda aportar al proceso de
              investigación que se deberá realizar
            </p>
            <p className="mb-2 font-bold">
              Hoja 1: Máximo 3450 Caracteres por hoja.
            </p>
            <div className="contador mb-2">
              {charCounts.relato1} / 3450 caracteres
            </div>
            <textarea
              id="relato_denuncia.hoja1"
              rows={10}
              maxLength={3450}
              className={getFieldClass("relato_denuncia.hoja1")}
              {...register("relato_denuncia.hoja1")}
              onChange={handleTextareaChange("relato_denuncia.hoja1", 3450)}
            />
            {errors.relato_denuncia?.hoja1 && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.relato_denuncia.hoja1.message}
              </span>
            )}

            <p className="mb-2 font-bold mt-6">
              Hoja 2 (Opcional): Máximo 3450 Caracteres por hoja.
            </p>
            <div className="contador mb-2">
              {charCounts.relato2} / 3450 caracteres
            </div>
            <textarea
              id="relato_denuncia.hoja2"
              rows={10}
              maxLength={3450}
              className={getFieldClass("relato_denuncia.hoja2")}
              {...register("relato_denuncia.hoja2")}
              onChange={handleTextareaChange("relato_denuncia.hoja2", 3450)}
            />
            {errors.relato_denuncia?.hoja2 && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.relato_denuncia.hoja2.message}
              </span>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* SECCIÓN DOCUMENTOS */}
      <CollapsibleSection
        ref={documentosRef}
        title="DOCUMENTOS DE RESPALDO (URLs)"
      >
        <div className="grid grid-cols-1 md:gap-x-6">
          <div className="col-span-full">
            <p className="mb-4">
              <strong>Puede proporcionar URLs o enlaces a documentos de respaldo.</strong>
              Ideal que los enlaces se encuentren lo más activos posible.
            </p>

            <div className="form-group mb-5">
              <label
                className="form-label"
                htmlFor="documentos_respaldo.url_dadoPorUsuario_2"
              >
                URL del Documento 1
              </label>
              <input
                type="url"
                id="documentos_respaldo.url_dadoPorUsuario_2"
                placeholder="Ingrese URL o enlace del documento"
                className={getFieldClass("documentos_respaldo.url_dadoPorUsuario_2")}
                {...register("documentos_respaldo.url_dadoPorUsuario_2")}
              />
              {errors.documentos_respaldo?.url_dadoPorUsuario_2 && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.documentos_respaldo.url_dadoPorUsuario_2.message}
                </span>
              )}
            </div>

            <div className="form-group mb-5">
              <label
                className="form-label"
                htmlFor="documentos_respaldo.url_dadoPorUsuario_3"
              >
                URL del Documento 2 (Opcional)
              </label>
              <input
                type="url"
                id="documentos_respaldo.url_dadoPorUsuario_3"
                placeholder="Ingrese URL o enlace del documento"
                className={getFieldClass("documentos_respaldo.url_dadoPorUsuario_3")}
                {...register("documentos_respaldo.url_dadoPorUsuario_3")}
              />
              {errors.documentos_respaldo?.url_dadoPorUsuario_3 && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.documentos_respaldo.url_dadoPorUsuario_3.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* DECLARACIÓN DE VERACIDAD */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="declaracion_veracidad"
            className="mt-1 mr-2 h-4 w-4 text-[#f09300]"
            {...register("declaracion_veracidad")}
          />
          <label htmlFor="declaracion_veracidad" className="text-sm">
            Declaro bajo juramento que la información proporcionada en este
            formulario es veraz y completa. Soy consciente que proporcionar
            información falsa puede tener consecuencias legales según la Ley N°
            20.393 que establece la responsabilidad penal de las personas
            jurídicas por los delitos de lavado de activos, financiamiento del
            terrorismo y delitos de cohecho.
          </label>
        </div>
        {errors.declaracion_veracidad && (
          <span className="text-red-500 text-sm mt-1 block">
            Debe aceptar la declaración de veracidad para continuar
          </span>
        )}
      </div>

      {/* BOTONES DE ENVÍO */}
      <div className="flex flex-col md:flex-row justify-center mt-8 gap-4">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <button
            type="button"
            className="btn btn-outline-secondary block w-full py-3 px-4 text-lg font-medium"
            onClick={generatePDF}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Generar PDF Respaldo
            </div>
          </button>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3">
          <button
            type="submit"
            className="btn btn-primary block w-full py-3 px-4 text-lg font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Denuncia"}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          <strong>
            Nota: Debe completar las opciones de selección (select, radio
            button, checkbox)
          </strong>
          , caso contrario no generará el PDF a descargar directamente en su pc
          o teléfono. Esto es simplemente un respaldo de su formulario antes de
          enviarlo.
        </p>
      </div>
    </form>
  );
};

export default FormLeyKarin;
