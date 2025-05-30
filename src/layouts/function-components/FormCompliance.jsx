import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { complianceFormSchema } from "@/schemas/complianceSchema"; // importa tu esquema zod aquí
import CollapsibleSection from "./CollapsibleSection";

const ComplianceForm = () => {
  const [formMessage, setFormMessage] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);

  // Dentro del componente:
  const messageRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(complianceFormSchema),
    mode: "all",
  });

  const adjuntarArchivos = watch("adjuntarArchivos");

  useEffect(() => {
    if (adjuntarArchivos && adjuntarArchivos.length > 0) {
      const filesArray = Array.from(adjuntarArchivos);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setFilePreviews(previews);

      return () => previews.forEach(URL.revokeObjectURL);
    } else {
      setFilePreviews([]);
    }
  }, [adjuntarArchivos]);

  const onSubmit = async (data) => {
    setFormMessage(null);

    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }

    try {
      const response = await fetch("/api/functions/compliance", {
        method: "POST",
        body: formData, // 👈 enviamos todo como FormData
      });

      if (response.ok) {
        setFormMessage({
          type: "success",
          text:  `¡Formulario enviado con éxito!
          Pronto enviaremos la confirmación de recepción a su correo o medio de contacto.`,
        });
        reset();
        setFilePreviews([]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormMessage({
          type: "error",
          text: errorData.message || `Error: ${response.status}`,
        });
      }
    } catch (err) {
      setFormMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      // Scroll hacia el mensaje
      section1Ref.current?.removeAttribute("open");
      section2Ref.current?.removeAttribute("open");
      setTimeout(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  const onInvalid = () => {
    setFormMessage({
      type: "error",
      text: "Por favor, corrige los errores antes de enviar.",
    });
  };

  const getBorderClass = (field) => {
    if (errors[field]) return "border-red-500";
    if (touchedFields[field]) return "border-green-500";
    return "border-gray-300";
  };

  return (
    <form
      className="lg:mx-4 mx-auto"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
    >
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

      <CollapsibleSection ref={section1Ref} title="DATOS DE LA DENUNCIA">
        <div className="form-group mb-5">
          <label htmlFor="fecha" className="form-label">
            Fecha
          </label>
          <input
            type="date"
            id="fecha"
            className={`form-control border ${getBorderClass("fecha")}`}
            {...register("fecha")}
          />
          {errors.fecha && (
            <p className="text-red-500 text-sm mt-1">{errors.fecha.message}</p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="horario" className="form-label">
            Horario
          </label>
          <input
            type="text"
            id="horario"
            placeholder="Ej: 10:00 - 11:00"
            className={`form-control border ${getBorderClass("horario")}`}
            {...register("horario")}
          />
          {errors.horario && (
            <p className="text-red-500 text-sm mt-1">
              {errors.horario.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="lugarIncidente" className="form-label">
            Lugar del incidente
          </label>
          <input
            type="text"
            id="lugarIncidente"
            className={`form-control border ${getBorderClass("lugarIncidente")}`}
            {...register("lugarIncidente")}
          />
          {errors.lugarIncidente && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lugarIncidente.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="incumplimientoAsociado" className="form-label">
            Incumplimiento asociado
          </label>
          <select
            id="incumplimientoAsociado"
            className={`form-control border ${getBorderClass("incumplimientoAsociado")}`}
            {...register("incumplimientoAsociado")}
          >
            <option value="">Selecciona</option>
            <option value="Código de Ética">Código de Ética</option>
            <option value="Eventuales delitos">Eventuales delitos</option>
            <option value="Infracciones al Manual de prevención">
              Infracciones al Manual de prevención
            </option>
            <option value="Otros">Otros</option>
          </select>
          {errors.incumplimientoAsociado && (
            <p className="text-red-500 text-sm mt-1">
              {errors.incumplimientoAsociado.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="tipoInfraccion" className="form-label">
            Tipo de infracción
          </label>
          <select
            id="tipoInfraccion"
            className={`form-control border ${getBorderClass("tipoInfraccion")}`}
            {...register("tipoInfraccion")}
          >
            <option value="">Selecciona</option>
            <option value="Aceptación de dinero o especies avaluadas en dinero">
              Aceptación de dinero o especies avaluadas en dinero
            </option>
            <option value="Robo o hurto de dinero, información u otros valores">
              Robo o hurto de dinero, información u otros valores
            </option>
            <option value="Corrupción entre particulares">
              Corrupción entre particulares
            </option>
            <option value="Cohecho a funcionario público">
              Cohecho a funcionario público
            </option>
            <option value="Delitos informáticos">Delitos informáticos</option>
            <option value="Incumplimiento normativa interna">
              Incumplimiento normativa interna
            </option>
            <option value="Otros">Otros</option>
          </select>
          {errors.tipoInfraccion && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tipoInfraccion.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="colaboradoresInvolucrados" className="form-label">
            Colaboradores involucrados
          </label>
          <select
            id="colaboradoresInvolucrados"
            className={`form-control border ${getBorderClass("colaboradoresInvolucrados")}`}
            {...register("colaboradoresInvolucrados")}
          >
            <option value="">Selecciona</option>
            <option value="colaborador1">Colaborador</option>
            <option value="externo">Externo</option>
            <option value="ambos">Ambos</option>
            <option value="nosabe">No sabe</option>
          </select>
          {errors.colaboradoresInvolucrados && (
            <p className="text-red-500 text-sm mt-1">
              {errors.colaboradoresInvolucrados.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="identificacionInvolucrados" className="form-label">
            Identificación de involucrados
          </label>
          <textarea
            id="identificacionInvolucrados"
            className={`form-control border ${getBorderClass("identificacionInvolucrados")}`}
            rows={3}
            {...register("identificacionInvolucrados")}
          ></textarea>
          {errors.identificacionInvolucrados && (
            <p className="text-red-500 text-sm mt-1">
              {errors.identificacionInvolucrados.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="detallesInfraccion" className="form-label">
            Detalles de la infracción
          </label>
          <textarea
            id="detallesInfraccion"
            className={`form-control border ${getBorderClass("detallesInfraccion")}`}
            rows={4}
            {...register("detallesInfraccion")}
          ></textarea>
          {errors.detallesInfraccion && (
            <p className="text-red-500 text-sm mt-1">
              {errors.detallesInfraccion.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="periodoHechos" className="form-label">
            Período de hechos
          </label>
          <input
            type="text"
            id="periodoHechos"
            className={`form-control border ${getBorderClass("periodoHechos")}`}
            {...register("periodoHechos")}
          />
          {errors.periodoHechos && (
            <p className="text-red-500 text-sm mt-1">
              {errors.periodoHechos.message}
            </p>
          )}
        </div>
        <div className="form-group mb-5">
          <label htmlFor="formaConocimiento" className="form-label">
            Forma en que ha tomado conocimiento de la información:
          </label>
          <input
            type="text"
            id="formaConocimiento"
            {...register("formaConocimiento")}
            placeholder="Ingrese información"
            className={`form-control border ${getBorderClass("formaConocimiento")}`}
          />
          {errors.formaConocimiento && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formaConocimiento.message}
            </p>
          )}
        </div>

        {/* Adjuntar archivos */}
        {/* <div className="form-group mb-5">
          <label htmlFor="adjuntarArchivos" className="form-label">
            Adjuntar archivos (opcional)
          </label>
          <input
            type="file"
            id="adjuntarArchivos"
            className={`form-control border ${getBorderClass("adjuntarArchivos")}`}
            {...register("adjuntarArchivos")}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            aria-describedby="adjuntarArchivosHelp"
          />
          <small id="adjuntarArchivosHelp" className="text-gray-600 text-sm">
            Puedes subir imágenes o documentos (máx 5 archivos).
          </small>
          {filePreviews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {filePreviews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Archivo adjunto previsualización ${i + 1}`}
                  className="h-16 w-16 object-cover rounded border"
                />
              ))}
            </div>
          )}
          {errors.adjuntarArchivos && (
            <p className="text-red-500 text-sm mt-1">{errors.adjuntarArchivos.message}</p>
          )}
        </div> */}
      </CollapsibleSection>

      <CollapsibleSection ref={section2Ref} title="DATOS DEL DENUNCIANTE">
        <div className="form-group mb-5">
          <label htmlFor="nombreDenunciante" className="form-label">
            Nombre completo
          </label>
          <input
            type="text"
            id="nombreDenunciante"
            className={`form-control border ${getBorderClass("nombreDenunciante")}`}
            {...register("nombreDenunciante")}
          />
          {errors.nombreDenunciante && (
            <p className="text-red-500 text-sm mt-1">
              {errors.nombreDenunciante.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="correoDenunciante" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            id="correoDenunciante"
            className={`form-control border ${getBorderClass("correoDenunciante")}`}
            {...register("correoDenunciante")}
          />
          {errors.correoDenunciante && (
            <p className="text-red-500 text-sm mt-1">
              {errors.correoDenunciante.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label htmlFor="telefonoDenunciante" className="form-label">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefonoDenunciante"
            placeholder="Ejemplo: 911223344"
            className={`form-control border ${getBorderClass("telefonoDenunciante")}`}
            {...register("telefonoDenunciante")}
          />
          {errors.telefonoDenunciante && (
            <p className="text-red-500 text-sm mt-1">
              {errors.telefonoDenunciante.message}
            </p>
          )}
        </div>

        <div className="form-group mb-5">
          <label className="form-label block mb-1">Anonimato</label>
          <div className="flex gap-6">
            <label>
              <input
                type="radio"
                value="si"
                {...register("confidencialidad")}
                className="mr-2"
              />
              Sí
            </label>
            <label>
              <input
                type="radio"
                value="no"
                {...register("confidencialidad")}
                className="mr-2"
              />
              No
            </label>
          </div>
          {errors.confidencialidad && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confidencialidad.message}
            </p>
          )}
        </div>
      </CollapsibleSection>

      <button
        type="submit"
        className="btn btn-primary block w-full mt-6"
        aria-label="Enviar denuncia"
      >
        Enviar denuncia
      </button>
    </form>
  );
};

export default ComplianceForm;
