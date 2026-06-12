import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Play,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useVSMFlow from "../../hooks/vsm/useVSMFlow";

const ETAPA_CONFIG = {
  pendientes: {
    icon: ShoppingCart,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600 bg-red-100",
    chartColor: "#ef4444",
  },
  inventario: {
    icon: Warehouse,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600 bg-orange-100",
    chartColor: "#f97316",
  },
  alistando: {
    icon: Play,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600 bg-blue-100",
    chartColor: "#3b82f6",
  },
  finalizadas: {
    icon: Package,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600 bg-emerald-100",
    chartColor: "#10b981",
  },
  delivery: {
    icon: Truck,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600 bg-yellow-100",
    chartColor: "#eab308",
  },
  entregadas: {
    icon: CheckCircle2,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600 bg-green-100",
    chartColor: "#22c55e",
  },
};

const formatHours = (seconds = 0) => `${(Number(seconds) / 3600).toFixed(2)} h`;

export default function VsmFlowDashboard() {
  const [umbralHoras, setUmbralHoras] = useState(24);
  const { data, loading } = useVSMFlow({ umbral_horas: umbralHoras });
  const [expanded, setExpanded] = useState({});
  const resumen = data.resumen ?? {};
  const etapas = data.etapas ?? [];
  const analisis = data.analisis ?? {};
  const procesos = analisis.procesos ?? [];
  const ordenesDetenidas = analisis.ordenes_detenidas ?? [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Cargando flujo VSM...
        </div>
      </div>
    );
  }

  const chartData = etapas.map((etapa) => ({
    name: etapa.nombre,
    cantidad: etapa.cantidad,
    horas: etapa.tiempo_promedio_horas,
    color: ETAPA_CONFIG[etapa.codigo]?.chartColor ?? "#64748b",
  }));
  const processChartData = procesos.map((proceso) => ({
    name: proceso.nombre,
    horas: proceso.tiempo_promedio_horas,
    muestras: proceso.muestras_total,
    color: proceso.tipo === "valor_agregado"
      ? "#22c55e"
      : proceso.tipo === "espera"
        ? "#ef4444"
        : "#f59e0b",
  }));
  const cuelloBotella = analisis.cuello_botella;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-[1600px] mx-auto px-5 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flujo VSM</h1>
              <p className="text-gray-500">
                Estado actual calculado desde la orden del cliente hasta la entrega
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Kpi title="Órdenes analizadas" value={resumen.total_ordenes ?? 0} />
            <Kpi title="En proceso" value={resumen.en_proceso ?? 0} />
            <Kpi title="Entregadas" value={resumen.entregadas ?? 0} />
            <Kpi title="Lead Time promedio" value={`${resumen.lead_time_promedio_horas ?? 0} h`} />
            <Kpi title="Tiempo sin valor agregado" value={`${resumen.tiempo_no_valor_agregado_promedio_horas ?? 0} h`} />
            <Kpi title="PCE" value={`${resumen.pce_porcentaje ?? 0}%`} />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-5 py-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Órdenes por etapa">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Tiempo promedio en etapa">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="h" />
                <Tooltip formatter={(value) => [`${value} h`, "Tiempo promedio"]} />
                <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                  {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Tiempos promedio por tramo">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processChartData} layout="vertical" margin={{ left: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit="h" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name, item) => [
                      `${value} h (${item.payload.muestras} muestras)`,
                      "Tiempo promedio",
                    ]}
                  />
                  <Bar dataKey="horas" radius={[0, 4, 4, 0]}>
                    {processChartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <section className="bg-white border rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold">Cuello de botella observado</h2>
            </div>
            {cuelloBotella?.muestras_total > 0 ? (
              <>
                <div className="text-xl font-bold text-gray-900">{cuelloBotella.nombre}</div>
                <div className="text-3xl font-bold text-red-600 mt-3">
                  {cuelloBotella.tiempo_promedio_horas} h
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Promedio calculado con {cuelloBotella.muestras_total} órdenes.
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No hay suficientes hitos para calcularlo.</div>
            )}
          </section>
        </div>

        <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold">Órdenes detenidas</h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              Sin cambiar de etapa por más de
              <select
                value={umbralHoras}
                onChange={(event) => setUmbralHoras(Number(event.target.value))}
                className="border rounded-lg px-2 py-1 text-gray-700"
              >
                <option value={8}>8 horas</option>
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={72}>72 horas</option>
                <option value={168}>7 días</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">OT</th>
                  <th className="text-left px-5 py-3">Cliente</th>
                  <th className="text-left px-5 py-3">Etapa</th>
                  <th className="text-right px-5 py-3">Tiempo detenido</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordenesDetenidas.map((item) => (
                  <tr key={item.orden_trabajo_id}>
                    <td className="px-5 py-3 font-semibold">OT #{item.orden_trabajo_id}</td>
                    <td className="px-5 py-3">{item.cliente}</td>
                    <td className="px-5 py-3 capitalize">{item.etapa}</td>
                    <td className="px-5 py-3 text-right font-semibold text-red-600">
                      {formatHours(item.tiempo_detenido_segundos)}
                    </td>
                  </tr>
                ))}
                {ordenesDetenidas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                      No hay órdenes detenidas con el umbral actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border rounded-xl shadow-sm p-5 overflow-x-auto">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Mapa del estado actual</h2>
          </div>

          <div className="flex min-w-[1450px] gap-4">
            {etapas.map((etapa, index) => {
              const config = ETAPA_CONFIG[etapa.codigo] ?? ETAPA_CONFIG.pendientes;
              const Icon = config.icon;
              const items = expanded[etapa.codigo] ? etapa.items : etapa.items.slice(0, 5);

              return (
                <div key={etapa.codigo} className="relative flex-1 min-w-[220px]">
                  <div className={`border-2 rounded-xl p-4 mb-3 ${config.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm">{etapa.nombre}</span>
                      </div>
                      <span className="font-bold">{etapa.cantidad}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Tiempo promedio: <strong>{formatHours(etapa.tiempo_promedio_segundos)}</strong>
                    </div>
                  </div>

                  {index < etapas.length - 1 && (
                    <div className="absolute top-8 -right-3 z-10 rounded-full bg-blue-600 p-1">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.orden_trabajo_id} className="border rounded-lg p-3 bg-white shadow-sm">
                        <div className="font-semibold text-sm">OT #{item.orden_trabajo_id}</div>
                        <div className="text-xs text-gray-500 truncate">{item.cliente?.nombre}</div>
                        <div className="flex items-center gap-1 text-xs text-blue-700 mt-2">
                          <Clock className="w-3 h-3" />
                          {formatHours(item.tiempo_etapa_segundos)}
                        </div>
                      </div>
                    ))}

                    {etapa.items.length === 0 && (
                      <div className="text-center text-sm text-gray-400 py-8">Sin órdenes</div>
                    )}

                    {etapa.items.length > 5 && (
                      <button
                        onClick={() => setExpanded((current) => ({
                          ...current,
                          [etapa.codigo]: !current[etapa.codigo],
                        }))}
                        className="w-full text-xs text-blue-600 border border-dashed rounded-lg py-2"
                      >
                        {expanded[etapa.codigo] ? "Ver menos" : `Ver ${etapa.items.length - 5} más`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}
