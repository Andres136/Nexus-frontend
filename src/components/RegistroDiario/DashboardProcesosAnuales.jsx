import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import Select from "react-select";
import { useEstadisticasDashboardProcesos } from "../../hooks/RegistroDiario/useEstadisticasDashboardProcesos";
import NexusLoader from "../NexusLoader";
import { 
  TrendingUp, 
  BarChart2, 
  Calendar, 
  Filter, 
  Building2, 
  XCircle 
} from "lucide-react"; // Asegúrate de tener lucide-react instalado

export default function DashboardProcesosAnuales() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [departamentosFiltro, setDepartamentosFiltro] = useState([]);
  
  // LOGICA INTACTA
  const { data, loading } = useEstadisticasDashboardProcesos(anio);
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <NexusLoader text="Cargando datos del dashboard..." />
    </div>
  );
  
  if (!data) return (
    <div className="flex justify-center items-center min-h-[400px] text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 m-6">
      <p>No hay datos disponibles para mostrar.</p>
    </div>
  );

  // LOGICA INTACTA
  const todosDepartamentos = data.departamentos.map(dep => ({
    value: dep.departamento_id,
    label: dep.departamento
  }));

  const departamentosFiltrados = departamentosFiltro.length === 0
    ? data.departamentos
    : data.departamentos.filter(dep => 
        departamentosFiltro.some(filtro => filtro.value === dep.departamento_id)
      );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* === HEADER Y CONTROLES === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-white to-slate-50">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Dashboard Anual de Procesos
              </h1>
              <p className="text-slate-500 mt-2 text-sm">
                Analítica de cumplimiento, rendimiento y novedades operativas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Filtro de Departamentos */}
              <div className="w-full sm:w-[320px] relative z-20">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Departamentos</label>
                </div>
                <Select
                  isMulti
                  placeholder="Todos los departamentos..."
                  options={todosDepartamentos}
                  value={departamentosFiltro}
                  onChange={(selectedOptions) => setDepartamentosFiltro(selectedOptions || [])}
                  menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                  menuPosition="fixed"
                  className="text-sm shadow-sm"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: '0.75rem',
                      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
                      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                      '&:hover': { borderColor: '#cbd5e1' },
                      padding: '2px'
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#eff6ff',
                      borderRadius: '0.375rem',
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#1d4ed8',
                      fontWeight: 500,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    })
                  }}
                />
              </div>

              {/* Filtro de Año */}
              <div className="w-full sm:w-auto relative z-10">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Año</label>
                </div>
                <select
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Botón Limpiar */}
              {departamentosFiltro.length > 0 && (
                <div className="pt-6">
                  <button
                    onClick={() => setDepartamentosFiltro([])}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors text-sm font-semibold"
                    title="Limpiar filtros"
                  >
                    <XCircle className="w-4 h-4" />
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de Filtros Activos (Tags) */}
          {departamentosFiltro.length > 0 && (
            <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 font-medium mr-2">Filtros activos:</span>
              {departamentosFiltro.map(dep => (
                <span key={dep.value} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                  {dep.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* === LISTA DE DEPARTAMENTOS === */}
        <div className="space-y-8">
          {departamentosFiltrados.map(dep => {
            
            // LOGICA INTACTA
            const chartData = dep.meses.map(m => ({
              mes: m.nombre_mes.substring(0, 3).toUpperCase(),
              cumplimiento: m.cumplimiento,
              noConformidades: m.no_conformidades,
              rendimiento: m.rendimiento || 0,
              eficiencia: m.eficiencia_tiempo || 0,
              registros: m.total_registros,
              novedades: m.novedades,
            }));
            return (
              <div
                key={dep.departamento_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Cabecera del Departamento */}
                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {dep.departamento}
                  </h2>
                </div>

                {/* Contenedor de Gráficas */}
                <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* 📈 Gráfica 1: Evolución del proceso */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-semibold text-slate-700">
                        Evolución de Indicadores (%)
                      </h3>
                    </div>

                    <div className="flex-1 min-h-[300px] bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="mes" 
                            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                            stroke="#e2e8f0"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            stroke="#e2e8f0"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                              fontWeight: 500
                            }}
                            cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                          <Line type="monotone" dataKey="cumplimiento" stroke="#10b981" strokeWidth={3} name="Indicadores %" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="noConformidades" stroke="#3b82f6" strokeWidth={3} name="No Conformidades %" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="rendimiento" stroke="#f59e0b" strokeWidth={3} name="Rendimiento Tareas %" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="eficiencia" stroke="#8b5cf6" strokeWidth={3} name="Eficiencia Tiempo %" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 📊 Gráfica 2: Volumen operativo */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart2 className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-slate-700">
                        Volumen Operativo y Novedades
                      </h3>
                    </div>

                    <div className="flex-1 min-h-[300px] bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="mes" 
                            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                            stroke="#e2e8f0"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            stroke="#e2e8f0"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              fontWeight: 500
                            }}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                          {/* Se redondearon las esquinas superiores de las barras para un look mas suave */}
                          <Bar dataKey="registros" fill="#94a3b8" name="Total Registros" radius={[4, 4, 0, 0]} maxBarSize={50} />
                          <Bar dataKey="novedades" fill="#f43f5e" name="Novedades (Problemas)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* === ESTADO VACÍO (NO COINCIDENCIAS) === */}
        {departamentosFiltrados.length === 0 && departamentosFiltro.length > 0 && (
          <div className="flex flex-col justify-center items-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
            <Filter className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Sin resultados</h3>
            <p className="text-slate-500 mt-1 max-w-md">
              No se encontraron departamentos que coincidan con el filtro actual. Intenta quitar algunos filtros para ver más resultados.
            </p>
            <button
              onClick={() => setDepartamentosFiltro([])}
              className="mt-6 px-5 py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors"
            >
              Borrar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}