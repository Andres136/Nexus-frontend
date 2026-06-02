import PropTypes from "prop-types";
import { useRegisterSeguridadSocial } from "../../hooks/nomina/useRegisterSeguridadSocial";

export default function RegisterSeguridadSocial({ uuid = null, onClose }) {
  const { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData } =
    useRegisterSeguridadSocial({ uuid, onSuccess: onClose });

  const isEdit = !!uuid;

  if (isEdit && isLoadingData) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48" />
        {[...Array(4)].map((_, i) => (
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
          {isEdit ? "Editar Entidad de Seguridad Social" : "Nueva Entidad de Seguridad Social"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? "Modifica los datos de la entidad." : "Complete los campos para registrar una nueva entidad."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Colpensiones"
            className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.nombre ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {fieldErrors.nombre && <p className="mt-1 text-xs text-red-500">{fieldErrors.nombre[0]}</p>}
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de entidad <span className="text-red-500">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.tipo ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            <option value="">Selecciona un tipo...</option>
            <option value="eps">EPS — Entidad Promotora de Salud</option>
            <option value="arl">ARL — Administradora de Riesgos Laborales</option>
            <option value="afp">AFP — Fondo de Pensiones</option>
            <option value="ccf">CCF — Caja de Compensación Familiar</option>
          </select>
          {fieldErrors.tipo && <p className="mt-1 text-xs text-red-500">{fieldErrors.tipo[0]}</p>}
        </div>

        {/* NIT */}
        <div>
          <label htmlFor="nit" className="block text-sm font-medium text-gray-700 mb-1">
            NIT <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nit"
            name="nit"
            value={formData.nit}
            onChange={handleChange}
            placeholder="Ej: 900123456-1"
            className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.nit ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {fieldErrors.nit && <p className="mt-1 text-xs text-red-500">{fieldErrors.nit[0]}</p>}
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ej: Calle 10 # 5-30"
            className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.direccion ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {fieldErrors.direccion && <p className="mt-1 text-xs text-red-500">{fieldErrors.direccion[0]}</p>}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.fecha_inicio ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {fieldErrors.fecha_inicio && <p className="mt-1 text-xs text-red-500">{fieldErrors.fecha_inicio[0]}</p>}
          </div>
          <div>
            <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.fecha_fin ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {fieldErrors.fecha_fin && <p className="mt-1 text-xs text-red-500">{fieldErrors.fecha_fin[0]}</p>}
          </div>
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

RegisterSeguridadSocial.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
