import PropTypes from "prop-types";
import { useRegisterValor } from "../../hooks/nomina/useRegisterValor";

const HORAS = [
  { name: "valor_hora_normal",          label: "Hora normal",           placeholder: "Ej: 8500" },
  { name: "valor_hora_nocturna",        label: "Hora nocturna",         placeholder: "Ej: 11000" },
  { name: "valor_hora_dominical",       label: "Hora dominical",        placeholder: "Ej: 12000" },
  { name: "valor_hora_dominical_extra", label: "Hora dominical extra",  placeholder: "Ej: 15000" },
];

export default function RegisterValor({ uuid = null, onClose }) {
  const { formData, handleChange, handleSubmit, fieldErrors, loading, isLoadingData } =
    useRegisterValor({ uuid, onSuccess: onClose });

  const isEdit = !!uuid;

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

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
          {isEdit ? "Editar Valores de Hora" : "Nuevos Valores de Hora"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isEdit
            ? "Modifica los valores de hora."
            : "Registra los valores de hora para la liquidación de nómina."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {HORAS.map(({ name, label, placeholder }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                min="0"
                placeholder={placeholder}
                className={inputClass(name)}
              />
              {fieldErrors[name] && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors[name][0]}</p>
              )}
            </div>
          ))}
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

RegisterValor.propTypes = {
  uuid: PropTypes.string,
  onClose: PropTypes.func,
};
