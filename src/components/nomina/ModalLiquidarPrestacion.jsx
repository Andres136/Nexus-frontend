import PropTypes from "prop-types";
import Select from "react-select";
import { useLiquidarPrestacion } from "../../hooks/nomina/useLiquidarPrestacion";

function fmt(value) {
  if (!value && value !== 0) return "$ 0";
  return "$ " + Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function fmtDate(value) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

const ETIQUETAS = {
  prima: {
    titulo: "Prima de servicios",
    sub: "Calculada sobre salario + auxilio de transporte + promedio variable · Art. 306 CST",
    color: "green",
  },
  cesantias: {
    titulo: "Cesantías e intereses",
    sub: "Cesantías: salario + auxilio + variable. Intereses: 12 % anual · Art. 249 y Ley 52/1975",
    color: "blue",
  },
  vacaciones_compensadas: {
    titulo: "Vacaciones compensadas",
    sub: "Días pendientes pagados en dinero · Art. 186 CST",
    color: "violet",
  },
  vacaciones_ordinarias: {
    titulo: "Vacaciones ordinarias",
    sub: "Pago separado de los días de descanso aprobados; estos días se excluyen de la nómina",
    color: "amber",
  },
};

const COLOR = {
  green:  { border: "border-green-100",  bg: "bg-green-50",  title: "text-green-900",  sub: "text-green-600",  badge: "bg-green-100 text-green-700" },
  blue:   { border: "border-blue-100",   bg: "bg-blue-50",   title: "text-blue-900",   sub: "text-blue-600",   badge: "bg-blue-100 text-blue-700" },
  violet: { border: "border-violet-100", bg: "bg-violet-50", title: "text-violet-900", sub: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
  amber:  { border: "border-amber-100",  bg: "bg-amber-50",  title: "text-amber-900",  sub: "text-amber-700",  badge: "bg-amber-100 text-amber-700" },
};

export default function ModalLiquidarPrestacion({ onClose }) {
  const {
    formData,
    handleChange,
    handleSelectEmpleado,
    handleSelectVacacion,
    handlePreview,
    handleSubmit,
    fieldErrors,
    loading,
    preview,
    previewLoading,
    empleadoOptions,
    empleadoSeleccionado,
    loadingEmpleados,
    vacacionesAprobadas,
    loadingVacaciones,
    esVacaciones,
    tipos,
  } = useLiquidarPrestacion({ onSuccess: onClose });

  const inputCls = (field) =>
    `block w-full h-10 px-3 rounded-md border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      fieldErrors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const etiqueta = ETIQUETAS[formData.tipo] ?? ETIQUETAS.prima;
  const col      = COLOR[etiqueta.color];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Liquidar prestación social</h2>
        <p className="text-sm text-gray-500 mt-1">Prima · Cesantías · Vacaciones ordinarias y compensadas</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de prestación</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={inputCls("tipo")}
          >
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

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

        {esVacaciones && formData.user_id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitud de vacaciones aprobada <span className="text-red-500">*</span>
            </label>
            <select
              name="vacacion_uuid"
              value={formData.vacacion_uuid}
              onChange={handleSelectVacacion}
              disabled={loadingVacaciones}
              className={inputCls("vacacion_uuid")}
            >
              <option value="">
                {loadingVacaciones ? "Consultando vacaciones..." : "Seleccione una solicitud"}
              </option>
              {vacacionesAprobadas.map((vacacion) => (
                <option key={vacacion.uuid} value={vacacion.uuid}>
                  {fmtDate(vacacion.fecha_inicio)} / {fmtDate(vacacion.fecha_fin)}
                  {" · "}{vacacion.dias_habiles} días
                  {vacacion.motivo ? ` · ${vacacion.motivo}` : ""}
                </option>
              ))}
            </select>
            {fieldErrors.vacacion_uuid && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.vacacion_uuid[0]}</p>
            )}
            {!loadingVacaciones && vacacionesAprobadas.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                El empleado no tiene solicitudes de este tipo aprobadas pendientes de liquidar.
              </p>
            )}
          </div>
        )}

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
              readOnly={esVacaciones}
              className={inputCls("periodo_inicio")}
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
              readOnly={esVacaciones}
              className={inputCls("periodo_fin")}
            />
            {fieldErrors.periodo_fin && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.periodo_fin[0]}</p>
            )}
          </div>
        </div>

        {/* Vista previa */}
        {preview && (
          <div className={`rounded-lg border ${col.border} ${col.bg} p-4 space-y-3`}>
            <div>
              <p className={`text-sm font-semibold ${col.title}`}>{etiqueta.titulo}</p>
              <p className={`text-xs mt-0.5 ${col.sub}`}>{etiqueta.sub}</p>
            </div>

            {/* Resumen principal */}
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-white/80 p-3">
                <p className={`text-xs ${col.sub}`}>Empleado</p>
                <p className="font-semibold text-gray-900">{empleadoSeleccionado?.label ?? "—"}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className={`text-xs ${col.sub}`}>Período</p>
                <p className="font-semibold text-gray-900">{fmtDate(preview.periodo_inicio)} / {fmtDate(preview.periodo_fin)}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className={`text-xs ${col.sub}`}>Días liquidados</p>
                <p className="font-semibold text-gray-900">{preview.dias_liquidados}</p>
              </div>
              <div className="rounded-md bg-white/80 p-3">
                <p className={`text-xs ${col.sub}`}>Total a pagar</p>
                <p className="font-semibold text-green-700 text-base">{fmt(preview.total_liquidado)}</p>
              </div>
            </div>

            {/* Detalle del cálculo */}
            <div className="rounded-md bg-white border border-gray-100 p-3 text-sm space-y-1.5">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${col.sub}`}>Detalle del cálculo</p>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Salario mensual base</span>
                <span className="font-medium">{fmt(preview.salario_mensual)}</span>
              </div>

              {!["vacaciones_ordinarias", "vacaciones_compensadas"].includes(preview.tipo) && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Auxilio de transporte</span>
                  <span className="font-medium">{fmt(preview.auxilio_transporte)}</span>
                </div>
              )}

              {(preview.promedio_variable ?? 0) > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Promedio variable (comisiones / extras)</span>
                  <span className="font-medium">{fmt(preview.promedio_variable)}</span>
                </div>
              )}

              <div className="flex justify-between gap-3 border-t border-dashed border-gray-200 pt-1.5">
                <span className="text-gray-500">Base de cálculo</span>
                <span className="font-semibold">{fmt(preview.base_calculo)}</span>
              </div>

              {["vacaciones_ordinarias", "vacaciones_compensadas"].includes(preview.tipo) ? (
                <>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Días ganados (contrato completo)</span>
                    <span className="font-medium">{Number(preview.dias_ganados_total ?? 0).toFixed(2)} días</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Días usados / disfrutados</span>
                    <span className="font-medium text-orange-600">- {Number(preview.dias_usados ?? 0).toFixed(2)} días</span>
                  </div>
                  {(preview.dias_ya_liquidados ?? 0) > 0 && (
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Días ya liquidados</span>
                      <span className="font-medium text-orange-600">- {Number(preview.dias_ya_liquidados).toFixed(2)} días</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3 border-t border-dashed border-gray-200 pt-1.5">
                    <span className="text-gray-500">Días de la solicitud aprobada</span>
                    <span className="font-semibold">{Number(preview.dias_vacaciones ?? 0).toFixed(4)} días</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Días disponibles antes de liquidar</span>
                    <span className="font-medium">{Number(preview.dias_disponibles ?? 0).toFixed(4)} días</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">
                      Valor {preview.tipo === "vacaciones_ordinarias" ? "vacaciones ordinarias" : "vacaciones compensadas"}
                    </span>
                    <span className="font-semibold text-green-700">{fmt(preview.valor_calculado)}</span>
                  </div>
                </>
              ) : preview.tipo === "cesantias" ? (
                <>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Cesantías (base × {preview.dias_liquidados} días / 360)</span>
                    <span className="font-medium">{fmt(preview.valor_calculado)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Intereses cesantías (12 % anual)</span>
                    <span className="font-medium">{fmt(preview.intereses_cesantias)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-dashed border-gray-200 pt-1.5 font-semibold">
                    <span className="text-gray-700">Total cesantías + intereses</span>
                    <span className="text-green-700">{fmt(preview.total_liquidado)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Prima (base × {preview.dias_liquidados} días / 360)</span>
                  <span className="font-semibold text-green-700">{fmt(preview.valor_calculado)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading || loading || (
              esVacaciones && !formData.vacacion_uuid
            )}
            className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {previewLoading ? "Calculando..." : "Preliquidar"}
          </button>
          <button
            type="submit"
            disabled={loading || !preview}
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
            ) : "Liquidar prestación"}
          </button>
        </div>
      </form>
    </div>
  );
}

ModalLiquidarPrestacion.propTypes = {
  onClose: PropTypes.func.isRequired,
};
