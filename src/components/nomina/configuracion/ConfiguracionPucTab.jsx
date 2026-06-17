import PropTypes from "prop-types";
import { Download, RotateCcw } from "lucide-react";

export default function ConfiguracionPucTab({
  conceptosLista,
  cuentasMovimiento,
  loadingConceptos,
  loadingCuentas,
  updateConceptoMutation,
  sincronizarConceptosMutation,
  descargandoPlantillaPuc,
  actualizarCuentaConcepto,
  sincronizarCuentasPuc,
  descargarPlantillaPucFaltante,
}) {
  return (
    <section className="mb-5 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Cuentas PUC por concepto
          </h2>
          <p className="text-sm text-gray-500">
            Asigna cada concepto de nómina a una cuenta del catálogo contable existente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={sincronizarCuentasPuc}
            disabled={sincronizarConceptosMutation.isPending}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 text-sm font-semibold text-indigo-700 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Sincronizar PUC
          </button>

          <button
            type="button"
            onClick={descargarPlantillaPucFaltante}
            disabled={descargandoPlantillaPuc}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Plantilla faltantes
          </button>

          <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            {conceptosLista.filter((item) => !item.puck_id).length} sin cuenta
          </div>
        </div>
      </div>

      {loadingConceptos || loadingCuentas ? (
        <div className="p-5 text-sm text-gray-500">
          Cargando conceptos contables...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Naturaleza</th>
                <th className="px-4 py-3 text-left">Cuenta PUC</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {conceptosLista.map((concepto) => (
                <tr key={concepto.uuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{concepto.nombre}</p>
                    <p className="text-xs text-gray-400">
                      {concepto.codigo}
                      {concepto.puck_numero_sugerido
                        ? ` · PUC sugerido ${concepto.puck_numero_sugerido}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">
                    {concepto.tipo}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">
                    {concepto.naturaleza}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={concepto.puck_id ?? ""}
                      disabled={updateConceptoMutation.isPending}
                      onChange={(event) =>
                        actualizarCuentaConcepto(concepto, event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
                    >
                      <option value="">Sin cuenta asignada</option>
                      {cuentasMovimiento.map((cuenta) => (
                        <option key={cuenta.id} value={cuenta.id}>
                          {cuenta.numero} - {cuenta.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {concepto.puck_id ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Configurado
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

ConfiguracionPucTab.propTypes = {
  conceptosLista: PropTypes.array.isRequired,
  cuentasMovimiento: PropTypes.array.isRequired,
  loadingConceptos: PropTypes.bool,
  loadingCuentas: PropTypes.bool,
  updateConceptoMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  sincronizarConceptosMutation: PropTypes.shape({ isPending: PropTypes.bool }).isRequired,
  descargandoPlantillaPuc: PropTypes.bool.isRequired,
  actualizarCuentaConcepto: PropTypes.func.isRequired,
  sincronizarCuentasPuc: PropTypes.func.isRequired,
  descargarPlantillaPucFaltante: PropTypes.func.isRequired,
};
