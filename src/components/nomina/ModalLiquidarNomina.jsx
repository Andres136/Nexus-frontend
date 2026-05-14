import PropTypes from "prop-types";
import Select from "react-select";
import { useLiquidarNomina } from "../../hooks/nomina/useLiquidarNomina";

export default function ModalLiquidarNomina({ onClose }) {
  const {
    formData,
    handleChange,
    handleSelectEmpleado,
    handleSubmit,
    fieldErrors,
    loading,
    empleados,
    loadingEmpleados,
    jornadas,
  } = useLiquidarNomina({ onSuccess: onClose });

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const empleadoOptions = empleados.map((e) => ({ value: e.value, label: e.label }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Procesar Nómina</h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona el empleado y período para liquidar automáticamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empleado <span className="text-red-500">*</span>
          </label>
          <Select
            options={empleadoOptions}
            isLoading={loadingEmpleados}
            onChange={handleSelectEmpleado}
            placeholder="Buscar empleado..."
            isClearable
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "40px",
                borderColor: fieldErrors.user_id ? "#f87171" : state.isFocused ? "#6366f1" : "#d1d5db",
                boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.3)" : "none",
                "&:hover": { borderColor: "#6366f1" },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#eef2ff" : "white",
                color: state.isSelected ? "white" : "#374151",
                fontSize: "0.875rem",
              }),
            }}
          />
          {fieldErrors.user_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.user_id[0]}</p>
          )}
        </div>

        {/* Jornada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jornada Laboral <span className="text-red-500">*</span>
          </label>
          <select
            name="jornada_laboral_id"
            value={formData.jornada_laboral_id}
            onChange={handleChange}
            className={inputClass("jornada_laboral_id")}
          >
            <option value="">Seleccionar jornada...</option>
            {jornadas.map((j) => (
              <option key={j.id} value={j.id}>{j.nombre}</option>
            ))}
          </select>
          {fieldErrors.jornada_laboral_id && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.jornada_laboral_id[0]}</p>
          )}
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="periodo_inicio"
              value={formData.periodo_inicio}
              onChange={handleChange}
              className={inputClass("periodo_inicio")}
            />
            {fieldErrors.periodo_inicio && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.periodo_inicio[0]}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="periodo_fin"
              value={formData.periodo_fin}
              onChange={handleChange}
              className={inputClass("periodo_fin")}
            />
            {fieldErrors.periodo_fin && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.periodo_fin[0]}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Procesando...
              </>
            ) : "Liquidar Nómina"}
          </button>
        </div>
      </form>
    </div>
  );
}

ModalLiquidarNomina.propTypes = {
  onClose: PropTypes.func.isRequired,
};
