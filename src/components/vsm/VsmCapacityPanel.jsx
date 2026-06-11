import { useState } from "react";
import { AlertTriangle, CalendarClock, Gauge, Users } from "lucide-react";
import useVSMCapacity from "../../hooks/vsm/useVSMCapacity";

const formatNumber = (value = 0, digits = 2) =>
  Number(value).toLocaleString("es-CO", { maximumFractionDigits: digits });

export default function VsmCapacityPanel({ usuarios }) {
  const [diasObjetivo, setDiasObjetivo] = useState(5);
  const { data, loading } = useVSMCapacity(usuarios, diasObjetivo);
  const resumen = data.resumen ?? {};
  const ordenesRiesgo = (data.ordenes ?? []).filter((orden) => orden.en_riesgo === true);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Gauge className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Takt Time y capacidad</h2>
            <p className="text-sm text-gray-500">
              Jornada temporal de 9 horas hasta integrar horarios desde nómina
            </p>
          </div>
        </div>

        <label className="text-sm text-gray-600">
          Horizonte:
          <select
            value={diasObjetivo}
            onChange={(event) => setDiasObjetivo(Number(event.target.value))}
            className="ml-2 border rounded-lg px-3 py-2"
          >
            <option value={1}>1 día laboral</option>
            <option value={5}>5 días laborales</option>
            <option value={10}>10 días laborales</option>
            <option value={20}>20 días laborales</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Calculando capacidad...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50">
            <Metric label="Takt requerido" value={`${formatNumber(resumen.takt_segundos_por_unidad)} s/u`} />
            <Metric label="Cycle Time histórico" value={`${formatNumber(resumen.cycle_time_segundos_por_unidad)} s/u`} />
            <Metric label="Carga pendiente" value={`${formatNumber(resumen.carga_pendiente_horas)} h`} />
            <Metric label="Capacidad disponible" value={`${formatNumber(resumen.capacidad_disponible_horas)} h`} />
            <Metric label="Usuarios disponibles" value={resumen.usuarios_disponibles ?? usuarios} icon={Users} />
            <Metric label="Usuarios requeridos" value={resumen.usuarios_requeridos ?? 0} icon={Users} />
            <Metric label="Órdenes en riesgo" value={resumen.ordenes_en_riesgo ?? 0} icon={AlertTriangle} danger />
            <Metric
              label="Sin histórico completo"
              value={resumen.ordenes_sin_historico_completo ?? 0}
              icon={AlertTriangle}
            />
            <Metric
              label="Cobertura histórica"
              value={`${formatNumber(resumen.cobertura_historica_porcentaje)}%`}
            />
          </div>

          <div className={`mx-6 mb-6 rounded-lg p-4 text-sm ${
            resumen.cumple_takt === true
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {resumen.cumple_takt === true
              ? "El Cycle Time histórico está dentro del Takt requerido para el horizonte seleccionado."
              : "El Cycle Time histórico supera el Takt requerido o no existe histórico suficiente."}
          </div>

          <div className="border-t">
            <div className="flex items-center gap-2 px-6 py-4">
              <CalendarClock className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Órdenes con riesgo de incumplimiento</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">OT</th>
                    <th className="px-5 py-3 text-left">Cliente</th>
                    <th className="px-5 py-3 text-right">Carga</th>
                    <th className="px-5 py-3 text-left">Prometida</th>
                    <th className="px-5 py-3 text-left">Estimada</th>
                    <th className="px-5 py-3 text-right">Histórico cubierto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ordenesRiesgo.slice(0, 50).map((orden) => (
                    <tr key={orden.orden_trabajo_id}>
                      <td className="px-5 py-3 font-semibold">OT #{orden.orden_trabajo_id}</td>
                      <td className="px-5 py-3">{orden.cliente}</td>
                      <td className="px-5 py-3 text-right">{formatNumber(orden.horas_estimadas)} h</td>
                      <td className="px-5 py-3">{orden.fecha_prometida ?? "Sin fecha"}</td>
                      <td className="px-5 py-3 text-red-600 font-medium">{orden.fecha_estimada}</td>
                      <td className="px-5 py-3 text-right">{formatNumber(orden.cobertura_historica_porcentaje)}%</td>
                    </tr>
                  ))}
                  {ordenesRiesgo.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                        No hay órdenes con riesgo calculado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 py-4 bg-amber-50 border-t text-xs text-amber-800">
            {data.advertencias?.[1]}
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value, icon: Icon, danger = false }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      {Icon && <Icon className={`w-4 h-4 mb-2 ${danger ? "text-red-600" : "text-purple-600"}`} />}
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-bold text-xl mt-1 ${danger ? "text-red-600" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}
