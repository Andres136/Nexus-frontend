import NexusLoader from "../../components/NexusLoader"
import { useDashboardKpis } from "../../hooks/calidad/useDashboardKpis"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts"

export default function DashboardCrm() {
  const year = new Date().getFullYear()
  const { kpis, loading } = useDashboardKpis(year)

  if (loading) return <NexusLoader text="Cargando dashboard..." />

  const series = kpis?.series_mensual || []
  const totales = kpis?.totales || {}

  // ---------- helpers ----------
  const money = (n) => {
    const num = Number(n || 0)
    return `$${num.toLocaleString()}`
  }

  const pct = (n) => {
    if (n === null || n === undefined) return "N/A"
    return `${Number(n).toFixed(2)}%`
  }

  // ---------- KPI cards (seguras) ----------
  const kpisCards = [
    { label: "Ventas Totales", value: money(totales.ventas) },
    { label: "Órdenes", value: totales.ordenes ?? 0 },
    { label: "Clientes Nuevos", value: totales.clientes_nuevos ?? 0 },
    { label: "Conversión", value: pct(totales.conversion_pct) }
  ]

  // ---------- Meses con actividad (para UX) ----------
  const activeMonths = series.filter(
    (m) => (Number(m.ventas) || 0) > 0 || (Number(m.ordenes) || 0) > 0 || (Number(m.clientes_nuevos) || 0) > 0
  )
  const lastActiveMonth = activeMonths[activeMonths.length - 1]?.label || "—"

  // ---------- Ranking anual (NO repetido por mes) ----------
  // Tu API trae ventas_por_usuario por mes, entonces lo consolidamos:
  const rankingMap = new Map()

  for (const m of series) {
    const list = m?.ventas_por_usuario || []
    for (const row of list) {
      const id = row.user_id
      const current = rankingMap.get(id) || {
        user_id: id,
        name: row?.user?.name || "Sin nombre",
        total_ordenes: 0,
        ventas: 0
      }

      current.total_ordenes += Number(row.total_ordenes || 0)
      current.ventas += Number(row.ventas || 0)

      rankingMap.set(id, current)
    }
  }

  const ranking = Array.from(rankingMap.values())
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 10) // top 10

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard CRM</h1>
          <p className="text-gray-500">
            Resumen general del sistema · Año {year} · Último mes con movimiento: <span className="font-medium text-gray-700">{lastActiveMonth}</span>
          </p>
        </div>

        {/* (Opcional) aquí luego metes selector de año */}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpisCards.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* GRAFICA PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Ventas por mes</h3>
          <span className="text-sm text-gray-500">Total: {money(totales.ventas)}</span>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value, name) => (name === "ventas" ? [money(value), "Ventas"] : [value, name])} />
            <Line type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GRAFICAS SECUNDARIAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ORDENES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Órdenes por mes</h3>
            <span className="text-sm text-gray-500">Total: {totales.ordenes ?? 0}</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="ordenes" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CLIENTES NUEVOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Clientes nuevos</h3>
            <span className="text-sm text-gray-500">Total: {totales.clientes_nuevos ?? 0}</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="clientes_nuevos" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* RANKING VENDEDORES (ANUAL, CONSOLIDADO) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-700">Ranking de vendedores (año {year})</h3>
          <span className="text-sm text-gray-500">Top {ranking.length}</span>
        </div>

        {ranking.length === 0 ? (
          <p className="text-gray-500">No hay ventas registradas para este año.</p>
        ) : (
          <div className="divide-y">
            {ranking.map((u, idx) => (
              <div key={u.user_id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.total_ordenes} órdenes</p>
                  </div>
                </div>

                <p className="font-semibold text-indigo-600">{money(u.ventas)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}