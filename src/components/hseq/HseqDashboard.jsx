import { useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis,
  CartesianGrid, BarChart, Bar, ResponsiveContainer, Legend
} from "recharts"
import { useHseqDashboard } from "../../hooks/hseq/useHseqDashboard"
import { useSedes } from "../../hooks/useSedes"
import NexusLoader from "../NexusLoader"
import { useGetInspeccionesFinalizadas } from "../../hooks/hseq/useGetInspeccionesFinalizadas"

import Select from "react-select"
import { HallazgosInspeccionesService } from "../../services/hseqService"

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
  const{ inspeccionesFinalizadas}=useGetInspeccionesFinalizadas()
            
//console.log("Inspecciones finalizadas en el dashboard:", inspeccionesFinalizadas);
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

  const descargarPdf = async () => {
    try {
      const response = await HallazgosInspeccionesService.getInformePdf(appliedFilters);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'informe_hseq.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  }
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 text-slate-800">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="bg-white p-6 rounded-2xl s border-slate-200 space-y-6">
  {/* FILA 1: TÍTULO Y ACCIONES DE EXPORTACIÓN */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
        Dashboard HSEQ
      </h1>
      <p className="text-slate-500 text-sm font-medium">
        Análisis de cumplimiento y seguridad
      </p>
    </div>

    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full text-xs font-bold border border-red-100 whitespace-nowrap">
        {hallazgos.length} Hallazgos
      </div>
      <button
        onClick={descargarPdf}
        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
      >
        <span>📄</span> PDF
      </button>
    </div>
  </div>

  {/* FILA 2: CONTROLES DE FILTRO */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Inicio</label>
      <input
        name="fecha_inicio"
        type="date"
        value={draftFilters.fecha_inicio}
        onChange={handleFilterChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fin</label>
      <input
        name="fecha_fin"
        type="date"
        value={draftFilters.fecha_fin}
        onChange={handleFilterChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sede</label>
      <select
        name="sede_id"
        value={draftFilters.sede_id}
        onChange={handleFilterChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
      >
        <option value="">Todas las Sedes</option>
        {sedes.map((s) => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Inspección</label>
      <Select
        options={(inspeccionesFinalizadas || []).map((i) => ({
          value: i.id,
          label: `${i.tipo} - ${i.fecha}`
        }))}
        placeholder="Buscar..."
        isClearable
        styles={customSelectStyles} // Ver nota abajo
        onChange={(selected) => {
          const value = selected?.value || "";
          setDraftFilters(prev => ({ ...prev, inspeccion_id: value }));
        }}
      />
    </div>

    {/* BOTONES DE ACCIÓN */}
    <div className="flex items-end gap-2 lg:col-span-4 xl:col-span-1">
      <button
        type="button"
        onClick={handleApplyFilters}
        className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-md"
      >
        Filtrar
      </button>
      <button
        type="button"
        onClick={handleClearFilters}
        className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-all"
      >
        Limpiar
      </button>
    </div>
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
const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    fontSize: '0.875rem',
    padding: '0.125rem',
    boxShadow: 'none',
    '&:hover': { borderColor: '#cbd5e1' }
  })
};