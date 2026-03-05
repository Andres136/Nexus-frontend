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
  CartesianGrid,
  Legend
} from "recharts"

export default function DashboardCrm() {

  const year = new Date().getFullYear()
  const { kpis, loading } = useDashboardKpis(year)

  if (loading) return <NexusLoader text="Cargando dashboard..." />

  const series = kpis?.series_mensual || []
  const totales = kpis?.totales || {}

  /* helpers */

  const money = (n) => `$${Number(n || 0).toLocaleString()}`
  const pct = (n) => `${Number(n || 0).toFixed(2)}%`

  /* KPI CARDS */

  const kpisCards = [
    {
      label: "Ventas Totales",
      value: money(totales.ventas)
    },
    {
      label: "Órdenes",
      value: totales.ordenes
    },
    {
      label: "Clientes Totales",
      value: totales.clientes_totales
    },
    {
      label: "Gestión Clientes",
      value: pct(totales.gestion_clientes_pct)
    },
    {
      label: "Conversión Clientes",
      value: pct(totales.conversion_clientes_pct)
    },
    {
      label: "Fidelización",
      value: pct(totales.fidelizacion_clientes_pct)
    },
    {
      label: "Ticket Promedio",
      value: money(totales.ticket_promedio)
    }
  ]

  /* Ticket promedio por mes */

  const ticketSeries = series.map(m => ({
    label: m.label,
    ticket: m.ordenes ? m.ventas / m.ordenes : 0
  }))

  /* Ranking vendedores */

  const rankingMap = new Map()

  for(const mes of series){

    const usuarios = mes.ventas_por_usuario || []

    for(const u of usuarios){

      const id = u.user_id

      const current = rankingMap.get(id) || {
        user_id: id,
        name: u.user?.name,
        ventas: 0,
        ordenes: 0
      }

      current.ventas += Number(u.ventas)
      current.ordenes += Number(u.total_ordenes)

      rankingMap.set(id,current)

    }

  }

  const ranking = Array.from(rankingMap.values())
    .sort((a,b)=> b.ventas - a.ventas)

  return (

    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard CRM
        </h1>

        <p className="text-gray-500">
          Analítica general del sistema · Año {year}
        </p>
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-6">

        {kpisCards.map((kpi,i)=>(

          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >

            <p className="text-sm text-gray-500">
              {kpi.label}
            </p>

            <p className="text-xl font-bold text-gray-800 mt-2">
              {kpi.value}
            </p>

          </div>

        ))}

      </div>

      {/* VENTAS */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <h3 className="font-semibold text-gray-700 mb-4">
          Ventas por mes
        </h3>

        <ResponsiveContainer width="100%" height={320}>

          <LineChart data={series}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="label"/>

            <YAxis/>

            <Tooltip formatter={(v)=>money(v)} />

            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#6366f1"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* ORDENES + CLIENTES */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <h3 className="font-semibold text-gray-700 mb-4">
            Órdenes por mes
          </h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart data={series}>

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="label"/>

              <YAxis/>

              <Tooltip/>

              <Bar
                dataKey="ordenes"
                fill="#10b981"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

          <h3 className="font-semibold text-gray-700 mb-4">
            Clientes nuevos
          </h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart data={series}>

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="label"/>

              <YAxis/>

              <Tooltip/>

              <Bar
                dataKey="clientes_nuevos"
                fill="#6366f1"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* FUNNEL CRM */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <h3 className="font-semibold text-gray-700 mb-4">
          Funnel CRM
        </h3>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={series}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="label"/>

            <YAxis/>

            <Tooltip/>

            <Legend/>

            <Bar
              dataKey="clientes_gestionados"
              fill="#f59e0b"
              name="Gestionados"
            />

            <Bar
              dataKey="clientes_con_orden"
              fill="#10b981"
              name="Compradores"
            />

            <Bar
              dataKey="clientes_fieles"
              fill="#6366f1"
              name="Fieles"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* TICKET PROMEDIO */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <h3 className="font-semibold text-gray-700 mb-4">
          Ticket promedio por mes
        </h3>

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={ticketSeries}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="label"/>

            <YAxis/>

            <Tooltip formatter={(v)=>money(v)} />

            <Line
              type="monotone"
              dataKey="ticket"
              stroke="#ef4444"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* RANKING */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <h3 className="font-semibold text-gray-700 mb-6">
          Ranking de vendedores
        </h3>

        {ranking.map((u,i)=>(

          <div
            key={u.user_id}
            className="flex justify-between border-b py-3"
          >

            <div className="flex gap-3 items-center">

              <span className="w-6 text-gray-500">
                {i+1}
              </span>

              <span className="font-medium">
                {u.name}
              </span>

            </div>

            <div className="text-indigo-600 font-semibold">
              {money(u.ventas)}
            </div>

          </div>

        ))}

      </div>

    </div>
  )
}