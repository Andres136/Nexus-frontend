import PropTypes from "prop-types";
import { Coins, Save, Trash2 } from "lucide-react";

export default function ConfiguracionParametrosLaboralesTab({
  parametroLaboralForm,
  ajusteForm,
  contratosLista,
  ajustesLista,
  loadingAjustes,
  parametroLaboralMutation,
  ajusteMutation,
  deleteAjusteMutation,
  handleParametroLaboral,
  handleAjuste,
  guardarParametroLaboral,
  guardarAjusteSalarial,
  eliminarAjuste,
  TIPOS_AJUSTE_SALARIAL,
  formatCOP,
}) {
  return (
    <>
      <form
        onSubmit={guardarParametroLaboral}
        className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Salario mínimo y auxilio vigente
            </h2>
            <p className="text-sm text-gray-500">
              Define el valor global que se puede llamar desde contratación sin cambiar los cálculos existentes.
            </p>
          </div>

          <button
            type="submit"
            disabled={parametroLaboralMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {parametroLaboralMutation.isPending
              ? "Guardando..."
              : "Guardar parámetro"}
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Año
            </span>
            <input
              type="number"
              name="anio"
              min="2000"
              value={parametroLaboralForm.anio}
              onChange={handleParametroLaboral}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Vigente desde
            </span>
            <input
              type="date"
              name="fecha_vigencia"
              value={parametroLaboralForm.fecha_vigencia}
              onChange={handleParametroLaboral}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Salario mínimo
            </span>
            <input
              type="number"
              name="salario_minimo"
              min="0"
              step="1"
              value={parametroLaboralForm.salario_minimo}
              onChange={handleParametroLaboral}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Auxilio transporte
            </span>
            <input
              type="number"
              name="auxilio_transporte"
              min="0"
              step="1"
              value={parametroLaboralForm.auxilio_transporte}
              onChange={handleParametroLaboral}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
            />
          </label>
        </div>
      </form>

      <form
        onSubmit={guardarAjusteSalarial}
        className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Ajustes salariales por vigencia
            </h2>
            <p className="text-sm text-gray-500">
              Configura salario mínimo, auxilio de transporte y aumentos especiales por empleado.
            </p>
          </div>

          <button
            type="submit"
            disabled={ajusteMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Coins className="h-4 w-4" />
            {ajusteMutation.isPending ? "Guardando..." : "Guardar ajuste"}
          </button>
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block md:col-span-2 xl:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Empleado / contrato
              </span>
              <select
                name="contratacion_id"
                value={ajusteForm.contratacion_id}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              >
                <option value="">Seleccionar contrato</option>
                {contratosLista.map((contrato) => (
                  <option key={contrato.id} value={contrato.id}>
                    {contrato.usuario?.name || contrato.correo || "Empleado"} · {contrato.cargo || "Sin cargo"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Tipo de ajuste
              </span>
              <select
                name="tipo_ajuste"
                value={ajusteForm.tipo_ajuste}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              >
                {TIPOS_AJUSTE_SALARIAL.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Aplica desde
              </span>
              <input
                type="date"
                name="fecha_vigencia"
                value={ajusteForm.fecha_vigencia}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Nuevo salario
              </span>
              <input
                type="number"
                min="0"
                step="1"
                name="salario_nuevo"
                value={ajusteForm.salario_nuevo}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Auxilio transporte
              </span>
              <input
                type="number"
                min="0"
                step="1"
                name="auxilio_nuevo"
                value={ajusteForm.auxilio_nuevo}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                No salarial
              </span>
              <input
                type="number"
                min="0"
                step="1"
                name="no_salarial_nuevo"
                value={ajusteForm.no_salarial_nuevo}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Aumento %
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="porcentaje_aumento"
                value={ajusteForm.porcentaje_aumento}
                onChange={handleAjuste}
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Motivo
              </span>
              <input
                type="text"
                name="motivo"
                value={ajusteForm.motivo}
                onChange={handleAjuste}
                placeholder="Ej. ajuste salario mínimo 2027"
                className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>

            <label className="block md:col-span-2 xl:col-span-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Observación
              </span>
              <textarea
                name="observacion"
                value={ajusteForm.observacion}
                onChange={handleAjuste}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-300"
              />
            </label>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-gray-900">Historial reciente</p>
              <p className="text-xs text-gray-500">
                Estos valores ya alimentan nómina, prestaciones y retiro.
              </p>
            </div>

            <div className="max-h-[360px] overflow-auto">
              {loadingAjustes ? (
                <div className="p-4 text-sm text-gray-500">
                  Cargando ajustes...
                </div>
              ) : ajustesLista.length ? (
                ajustesLista.map((ajuste) => (
                  <div
                    key={ajuste.uuid}
                    className="border-b border-gray-100 bg-white px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {ajuste.empleado?.name ||
                            ajuste.contratacion?.usuario?.name ||
                            "Empleado"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {String(ajuste.fecha_vigencia || "").slice(0, 10)} · {TIPOS_AJUSTE_SALARIAL.find((tipo) => tipo.value === ajuste.tipo_ajuste)?.label || ajuste.tipo_ajuste}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarAjuste(ajuste.uuid)}
                        disabled={deleteAjusteMutation.isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        title="Eliminar ajuste"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-gray-50 px-2 py-1">
                        <span className="text-gray-400">Antes</span>
                        <p className="font-semibold text-gray-700">
                          {formatCOP(ajuste.salario_anterior)}
                        </p>
                      </div>

                      <div className="rounded-md bg-emerald-50 px-2 py-1">
                        <span className="text-emerald-600">Nuevo</span>
                        <p className="font-semibold text-emerald-700">
                          {formatCOP(ajuste.salario_nuevo)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  Aún no hay ajustes salariales registrados.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

ConfiguracionParametrosLaboralesTab.propTypes = {
  parametroLaboralForm: PropTypes.object.isRequired,
  ajusteForm: PropTypes.object.isRequired,
  contratosLista: PropTypes.array.isRequired,
  ajustesLista: PropTypes.array.isRequired,
  loadingAjustes: PropTypes.bool,
  parametroLaboralMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  ajusteMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  deleteAjusteMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  handleParametroLaboral: PropTypes.func.isRequired,
  handleAjuste: PropTypes.func.isRequired,
  guardarParametroLaboral: PropTypes.func.isRequired,
  guardarAjusteSalarial: PropTypes.func.isRequired,
  eliminarAjuste: PropTypes.func.isRequired,
  TIPOS_AJUSTE_SALARIAL: PropTypes.array.isRequired,
  formatCOP: PropTypes.func.isRequired,
};
