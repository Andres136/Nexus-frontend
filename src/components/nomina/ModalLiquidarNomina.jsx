import PropTypes from "prop-types";
import Select from "react-select";
import { useLiquidarNomina } from "../../hooks/nomina/useLiquidarNomina";

function formatCOP(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO");
}

export default function ModalLiquidarNomina({ onClose, initialData = {} }) {
  const {
    formData,
    handleChange,
    handleSelectEmpleado,
    handlePreview,
    handleSubmit,
    fieldErrors,
    loading,
    preview,
    previewLoading,
    empleados,
    loadingEmpleados,
    jornadas,
    loadingJornadas,
  } = useLiquidarNomina({ onSuccess: onClose, initialData });

  const inputClass = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const empleadoOptions = empleados.map((e) => ({ value: e.value, label: e.label }));
  const empleadoSeleccionado = empleadoOptions.find((e) => String(e.value) === String(formData.user_id)) ?? null;

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
            value={empleadoSeleccionado}
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
            Jornada Laboral
          </label>
          <select
            name="jornada_laboral_id"
            value={formData.jornada_laboral_id}
            onChange={handleChange}
            disabled={loadingJornadas}
            className={inputClass("jornada_laboral_id")}
          >
            <option value="">{loadingJornadas ? "Cargando jornadas..." : "Usar jornada del ingreso..."}</option>
            {jornadas.map((j) => (
              <option key={j.id} value={j.id}>{j.nombre} · {j.horas_semanales} h/semana</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Si la dejas vacía se toma la jornada registrada en los ingresos del período.
          </p>
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

        {preview && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-900 mb-3">Vista previa</p>
            {preview.advertencias?.length > 0 && (
              <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800">Advertencia</p>
                {preview.advertencias.map((advertencia) => (
                  <p key={advertencia} className="mt-1 text-xs text-amber-700">
                    {advertencia}
                  </p>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-indigo-500">Devengado</p>
                <p className="font-semibold text-gray-900">{formatCOP(preview.total_devengado)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Deducciones</p>
                <p className="font-semibold text-orange-600">{formatCOP(preview.total_deducciones)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Neto a pagar</p>
                <p className="font-semibold text-green-700">{formatCOP(preview.salario_neto)}</p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Horas extra</p>
                <p className="font-semibold text-gray-900">
                  {Number(preview.horas_extras_diurnas || 0)
                    + Number(preview.horas_extras_nocturnas || 0)
                    + Number(preview.horas_festivas || 0)
                    + Number(preview.horas_nocturnas_festivas || 0)} h
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Jornada</p>
                <p className="font-semibold text-gray-900">
                  {preview.horas_semanales_jornada ?? "—"} h/semana
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Horas período</p>
                <p className="font-semibold text-gray-900">
                  {preview.horas_esperadas_periodo ?? "—"} h
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500">Valor hora</p>
                <p className="font-semibold text-gray-900">{formatCOP(preview.valor_hora_normal)}</p>
              </div>
            </div>
          </div>
        )}

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
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || loading}
            className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {previewLoading ? "Calculando..." : "Preliquidar"}
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
  initialData: PropTypes.object,
};
