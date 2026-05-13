import PropTypes from "prop-types";
import { useRegistrarTipoContrato } from "../../hooks/nomina/useRegistorTipoContrato";

export default function RegisterTipoContrato({ id = null, onClose }) {
  const { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData } =
    useRegistrarTipoContrato({ id, onSuccess: onClose });

  const isEdit = !!id;

  if (isEdit && isLoadingData) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48" />
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Editar Tipo de Contrato" : "Nuevo Tipo de Contrato"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit ? "Modifica los datos del tipo de contrato." : "Complete los campos para crear un nuevo tipo de contrato."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
            placeholder="Ej: Término fijo"
            className={`block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.nombre ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {fieldErrors.nombre && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.nombre[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion ?? ""}
            onChange={handleChange}
            rows={4}
            placeholder="Describe brevemente este tipo de contrato..."
            className={`block w-full px-3 py-2 rounded-md border shadow-sm text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErrors.descripcion ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {fieldErrors.descripcion && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.descripcion[0]}</p>
          )}
        </div>

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

RegisterTipoContrato.propTypes = {
  id: PropTypes.string,
  onClose: PropTypes.func,
};
