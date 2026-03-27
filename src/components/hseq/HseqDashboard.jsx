import { useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis,
  CartesianGrid, BarChart, Bar, ResponsiveContainer, Legend
} from "recharts"
import { useHseqDashboard } from "../../hooks/hseq/useHseqDashboard"
import { useSedes } from "../../hooks/useSedes"
import NexusLoader from "../NexusLoader"

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"]

export default function HseqDashboard() {
  const initialFilters = {
    fecha_inicio: "",
    fecha_fin: "",
    sede_id: "",
    responsable_id: "",
    estado: ""
  }

  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)

  const { data, isLoading, isFetching } = useHseqDashboard(appliedFilters)
  const { sedes = [] } = useSedes()

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setDraftFilters((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters)
  }

  const handleClearFilters = () => {
    setDraftFilters(initialFilters)
    setAppliedFilters(initialFilters)
  }

  if (isLoading && !data) {
    return <NexusLoader text="Sincronizando indicadores..." />
  }

  const {
    kpis = {},
    estado_inspecciones = [],
    por_sede = [],
    tendencia = [],
    hallazgos = [],
  } = data || {}

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 text-slate-800">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Dashboard HSEQ
            </h1>
            <p className="text-slate-500 font-medium">
              Análisis de cumplimiento y seguridad
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input
              name="fecha_inicio"
              type="date"
              value={draftFilters.fecha_inicio}
              onChange={handleFilterChange}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />

            <input
              name="fecha_fin"
              type="date"
              value={draftFilters.fecha_fin}
              onChange={handleFilterChange}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />

            <select
              name="sede_id"
              value={draftFilters.sede_id}
              onChange={handleFilterChange}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              <option value="">Todas las Sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            <select
              name="estado"
              value={draftFilters.estado}
              onChange={handleFilterChange}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-600"
            >
              <option value="">Cualquier Estado</option>
              <option value="finalizada">Finalizada</option>
              <option value="pendiente">Pendiente</option>
            </select>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200"
            >
              Aplicar
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-all"
            >
              Limpiar
            </button>
          </div>
        </div>

        {isFetching && (
          <p className="text-xs text-slate-400 mt-3">Actualizando datos...</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Inspecciones" value={kpis.total_inspecciones ?? 0} icon="📋" />
        <StatCard title="Finalizadas" value={kpis.finalizadas ?? 0} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Pendientes" value={kpis.pendientes ?? 0} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Fallas Detectadas" value={kpis.total_fallas ?? 0} color="text-red-600" bg="bg-red-50" />
        <StatCard title="% Cumplimiento" value={`${kpis.porcentaje_cumplimiento ?? 0}%`} color="text-blue-700" isBold />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartBox title="Estado Global" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={estado_inspecciones} dataKey="total" nameKey="estado" innerRadius={70} outerRadius={90} paddingAngle={8}>
                {estado_inspecciones.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Inspecciones por Sede" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={por_sede} margin={{ top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="sede" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      <ChartBox title="Actividad en el Tiempo">
        <ResponsiveContainer width="100%" height={350}>
    <LineChart data={tendencia}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="fecha" />
  <YAxis domain={[0, 100]} />
  <Tooltip />
  <Line
    type="linear"
    dataKey="cumplimiento"
    stroke="#22c55e"
    strokeWidth={3}
    dot={{ r: 5 }}
  />
</LineChart>
        </ResponsiveContainer>
      </ChartBox>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Hallazgos y Fallas Críticas</h2>
            <p className="text-slate-500 text-sm">Ítems que requieren atención inmediata</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-100">
            {hallazgos.length} Hallazgos abiertos
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <th className="px-8 py-5">Inspección</th>
                <th className="px-8 py-5">Sede</th>
                <th className="px-8 py-5">Pregunta / Punto de Falla</th>
                <th className="px-8 py-5">Responsable</th>
                <th className="px-8 py-5 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hallazgos.map((h, i) => (
                <tr key={i} className="group hover:bg-slate-50/80 transition-all cursor-default">
                  <td className="px-8 py-5 font-bold text-slate-900">{h.tipo_inspeccion}</td>
                  <td className="px-8 py-5">{h.sede}</td>
                  <td className="px-8 py-5 text-slate-500 max-w-sm">
                    <p className="italic leading-relaxed">"{h.pregunta}"</p>
                  </td>
                  <td className="px-8 py-5">{h.responsable}</td>
                  <td className="px-8 py-5 text-right text-slate-400 font-mono text-xs">{h.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hallazgos.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-medium">Sin fallas críticas registradas para este filtro</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, color = "text-slate-800", bg = "bg-white", isBold, icon }) => (
  <div className={`${bg} p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md group`}>
    <div className="flex justify-between items-start mb-2">
      <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">{title}</p>
      {icon && <span className="opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>}
    </div>
    <p className={`text-3xl ${isBold ? "font-black" : "font-extrabold"} ${color}`}>
      {value}
    </p>
  </div>
)

const ChartBox = ({ title, children, className = "" }) => (
  <div className={`bg-white p-8 rounded-2xl shadow-sm border border-slate-200 ${className}`}>
    <h2 className="text-lg font-bold text-slate-800 mb-8">{title}</h2>
    {children}
  </div>
)