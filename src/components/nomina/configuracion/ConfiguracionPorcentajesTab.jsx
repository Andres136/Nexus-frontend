import PropTypes from "prop-types";
import { Clock3, Save } from "lucide-react";

export default function ConfiguracionPorcentajesTab({
  configForm,
  loadingConfig,
  configError,
  configReady,
  configMutation,
  handleConfig,
  guardarConfig,
}) {
  return (
    <form
      onSubmit={guardarConfig}
      className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Porcentajes y recargos de liquidación
          </h2>
          <p className="text-sm text-gray-500">
            Estos valores se usan en preliquidación, liquidación, horas extra, festivos e incapacidad.
          </p>
        </div>

        <button
          type="submit"
          disabled={loadingConfig || !configReady || Boolean(configError) || configMutation.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {configMutation.isPending ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>

      {configError && (
        <div className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No fue posible cargar la configuración de nómina. Recarga la página antes de guardar cambios.
        </div>
      )}

      <div className="space-y-5 p-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Deducciones al empleado
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: "porcentaje_salud_empleado",
                label: "Salud empleado",
                puc: "237005",
              },
              {
                name: "porcentaje_pension_empleado",
                label: "Pensión empleado",
                puc: "237010",
              },
            ].map(({ name, label, puc }) => (
              <label key={name} className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {label} <span className="font-normal text-gray-300">· {puc}</span>
                </span>
                <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    name={name}
                    value={configForm[name]}
                    onChange={handleConfig}
                    className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
                  />
                  <span className="text-xs font-semibold text-gray-400">%</span>
                </div>
              </label>
            ))}

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                Resumen empleado
              </p>
              <p className="mt-1 text-sm font-bold text-indigo-900">
                Salud {Number(configForm.porcentaje_salud_empleado || 0).toFixed(2)}% · Pensión {Number(configForm.porcentaje_pension_empleado || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Recargos de horas y festivos
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { name: "recargo_extra_diurna", label: "Extra diurna", hint: "0.25 = 25%" },
              { name: "recargo_extra_nocturna", label: "Extra nocturna", hint: "0.75 = 75%" },
              { name: "recargo_festiva", label: "Festiva", hint: "0.75 = 75%" },
              { name: "recargo_nocturna_festiva", label: "Nocturna festiva", hint: "1.10 = 110%" },
              {
                name: "porcentaje_incapacidad",
                label: "Incapacidad reconocida",
                hint: "0.6667 = 66.67%",
                step: "0.0001",
                max: "1",
              },
            ].map(({ name, label, hint, step = "0.01", max = "5" }) => (
              <label key={name} className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {label}
                </span>
                <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3">
                  <input
                    type="number"
                    min="0"
                    max={max}
                    step={step}
                    required
                    name={name}
                    value={configForm[name]}
                    onChange={handleConfig}
                    className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
                  />
                  <span className="text-xs font-semibold text-emerald-500">x</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">{hint}</p>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Rango nocturno
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "hora_inicio_nocturna", label: "Inicio nocturno" },
              { name: "hora_fin_nocturna", label: "Fin nocturno" },
            ].map(({ name, label }) => (
              <label key={name} className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {label}
                </span>
                <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
                  <Clock3 className="h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    required
                    name={name}
                    value={configForm[name]}
                    onChange={handleConfig}
                    className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>
              </label>
            ))}

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Horario aplicado
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {configForm.hora_inicio_nocturna || "--:--"} a {configForm.hora_fin_nocturna || "--:--"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Aportes empleador (costo empresa)
          </p>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              { name: "porcentaje_salud_empleador", label: "Salud empleador", puc: "250505", step: "0.01" },
              { name: "porcentaje_pension_empleador", label: "Pensión empleador", puc: "250510", step: "0.01" },
              { name: "porcentaje_arl", label: "ARL", puc: "250515", step: "0.001" },
              { name: "porcentaje_sena", label: "SENA", puc: "250520", step: "0.01" },
              { name: "porcentaje_icbf", label: "ICBF", puc: "250525", step: "0.01" },
              { name: "porcentaje_caja_compensacion", label: "Caja compensación", puc: "250530", step: "0.01" },
            ].map(({ name, label, puc, step }) => (
              <label key={name} className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {label} <span className="font-normal text-gray-300">· {puc}</span>
                </span>
                <div className="mt-1 flex h-11 items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step={step}
                    required
                    name={name}
                    value={configForm[name]}
                    onChange={handleConfig}
                    className="w-full border-none bg-transparent text-sm text-gray-800 outline-none"
                  />
                  <span className="text-xs font-semibold text-amber-400">%</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Total costo empleador sobre base prestacional
            </p>
            <p className="mt-1 text-sm font-bold text-amber-900">
              {(
                Number(configForm.porcentaje_salud_empleador || 0) +
                Number(configForm.porcentaje_pension_empleador || 0) +
                Number(configForm.porcentaje_arl || 0) +
                Number(configForm.porcentaje_sena || 0) +
                Number(configForm.porcentaje_icbf || 0) +
                Number(configForm.porcentaje_caja_compensacion || 0)
              ).toFixed(3)}%
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

ConfiguracionPorcentajesTab.propTypes = {
  configForm: PropTypes.object.isRequired,
  loadingConfig: PropTypes.bool,
  configError: PropTypes.object,
  configReady: PropTypes.bool,
  configMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  handleConfig: PropTypes.func.isRequired,
  guardarConfig: PropTypes.func.isRequired,
};
