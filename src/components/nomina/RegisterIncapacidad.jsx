import PropTypes from "prop-types";
import { useRegisterIncapacidad } from "../../hooks/nomina/useRegisterIncapacidad";
import { useGetSeguridadSocial } from "../../hooks/nomina/useGetSeguridadSocial";

export default function RegisterIncapacidad({ uuid = null, onClose }) {
  const {
    formData,
    handleChange,
    handleSubmit,
    fieldErrors,
    loading,
    isLoadingData,
    soporteActual,
  } = useRegisterIncapacidad({ uuid, onSuccess: onClose });

  const { seguridadSociales } = useGetSeguridadSocial();
  const entidades = seguridadSociales?.data?.data ?? [];

  const isEdit = !!uuid;

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  if (isEdit && isLoadingData) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48" />
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Editar Incapacidad" : "Nueva Incapacidad"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Modifica los datos de la incapacidad."
            : "Complete los campos para registrar una nueva incapacidad."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Tipo de incapacidad */}
        <div>
          <label htmlFor="tipo_incapacidad" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de incapacidad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="tipo_incapacidad"
            name="tipo_incapacidad"
            value={formData.tipo_incapacidad}
            onChange={handleChange}
            maxLength={45}
            placeholder="Ej: Enfermedad general"
            className={inputClass("tipo_incapacidad")}
          />
          {fieldErrors.tipo_incapacidad && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.tipo_incapacidad[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-1">
            Origen <span className="text-red-500">*</span>
          </label>
          <select
            id="origen"
            name="origen"
            value={formData.origen}
            onChange={handleChange}
            className={inputClass("origen")}
          >
            <option value="eps">EPS - enfermedad general</option>
            <option value="arl">ARL - accidente/enfermedad laboral</option>
          </select>
          {fieldErrors.origen && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.origen[0]}</p>
          )}
        </div>

        {/* Entidad médica */}
        <div>
          <label htmlFor="identidad_medica_id" className="block text-sm font-medium text-gray-700 mb-1">
            Entidad médica <span className="text-red-500">*</span>
          </label>
          <select
            id="identidad_medica_id"
            name="identidad_medica_id"
            value={formData.identidad_medica_id}
            onChange={handleChange}
            className={inputClass("identidad_medica_id")}
          >
            <option value="">Seleccione una entidad</option>
            {entidades.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          {fieldErrors.identidad_medica_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.identidad_medica_id[0]}</p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="inicio" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="inicio"
              name="inicio"
              value={formData.inicio}
              onChange={handleChange}
              className={inputClass("inicio")}
            />
            {fieldErrors.inicio && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.inicio[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="fin" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fin"
              name="fin"
              value={formData.fin}
              onChange={handleChange}
              className={inputClass("fin")}
            />
            {fieldErrors.fin && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.fin[0]}</p>
            )}
          </div>
        </div>

        {/* Soporte */}
        <div>
          <label htmlFor="soporte" className="block text-sm font-medium text-gray-700 mb-1">
            Soporte {!isEdit && <span className="text-gray-400 text-xs">(PDF, JPG, PNG — máx. 2MB)</span>}
          </label>
          {isEdit && soporteActual && (
            <a
              href={soporteActual}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mb-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Ver soporte actual
            </a>
          )}
          <input
            type="file"
            id="soporte"
            name="soporte"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
          />
          {fieldErrors.soporte && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.soporte[0]}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Guardando...
              </>
            ) : isEdit ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

RegisterIncapacidad.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
