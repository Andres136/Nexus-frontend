import PropTypes from "prop-types";
import { useRegisterJornadaLaboral } from "../../hooks/nomina/useRegisterJornadaLaboral";

export default function RegisterJornadaLaboral({ uuid = null, onClose }) {
  const { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData } =
    useRegisterJornadaLaboral({ uuid, onSuccess: onClose });

  const isEdit = !!uuid;

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  if (isEdit && isLoadingData) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48" />
        {[...Array(3)].map((_, i) => (
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
          {isEdit ? "Editar Jornada Laboral" : "Nueva Jornada Laboral"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Modifica los datos de la jornada laboral."
            : "Complete los campos para registrar una nueva jornada laboral."}
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
            maxLength={100}
            placeholder="Ej: Jornada diurna"
            className={inputClass("nombre")}
          />
          {fieldErrors.nombre && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.nombre[0]}</p>
          )}
        </div>

        {/* Horas semanales */}
        <div>
          <label htmlFor="horas_semanales" className="block text-sm font-medium text-gray-700 mb-1">
            Horas semanales <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="horas_semanales"
            name="horas_semanales"
            value={formData.horas_semanales}
            onChange={handleChange}
            min="1"
            max="48"
            placeholder="Ej: 40"
            className={inputClass("horas_semanales")}
          />
          {fieldErrors.horas_semanales && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.horas_semanales[0]}</p>
          )}
        </div>

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={!!formData.status}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Activo
            </label>
          </div>
        )}

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

RegisterJornadaLaboral.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
