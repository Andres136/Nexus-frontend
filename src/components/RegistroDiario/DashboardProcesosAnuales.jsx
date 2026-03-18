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

export default function DashboardProcesosAnuales() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [departamentosFiltro, setDepartamentosFiltro] = useState([]);
  const { data, loading } = useEstadisticasDashboardProcesos(anio);

  if (loading) return <div className="text-center py-10">Cargando…</div>;
  if (!data) return <div>No hay datos disponibles</div>;

  // Obtener lista única de departamentos para el filtro
  const todosDepartamentos = data.departamentos.map(dep => ({
    value: dep.departamento_id,
    label: dep.departamento
  }));

  // Filtrar departamentos según selección
  const departamentosFiltrados = departamentosFiltro.length === 0
    ? data.departamentos
    : data.departamentos.filter(dep => 
        departamentosFiltro.some(filtro => filtro.value === dep.departamento_id)
      );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">
            Dashboard Procesos Anuales – {anio}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Filtro por departamentos */}
            <div className="flex-1 lg:min-w-[300px]">
              <Select
                isMulti
                placeholder="Filtrar departamentos..."
                options={todosDepartamentos}
                value={departamentosFiltro}
                onChange={(selectedOptions) => 
                  setDepartamentosFiltro(selectedOptions || [])
                }
                className="text-sm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#9ca3af' },
                  }),
                }}
              />
            </div>

            {/* Selector de año */}
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Botón limpiar filtros */}
            {departamentosFiltro.length > 0 && (
              <button
                onClick={() => setDepartamentosFiltro([])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {departamentosFiltro.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <span className="font-medium">Mostrando {departamentosFiltrados.length} de {data.departamentos.length} departamentos:</span>
              {' '}
              {departamentosFiltro.map(dep => dep.label).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Departamentos */}
      <div className="space-y-6">
        {departamentosFiltrados.map(dep => {
          const chartData = dep.meses.map(m => ({
            mes: m.nombre_mes,
            cumplimiento: m.cumplimiento,
            estabilidad: m.estabilidad,
              rendimiento: m.rendimiento || 0, 
            registros: m.total_registros,
            novedades: m.novedades,
          }));

          return (
            <div
              key={dep.departamento_id}
              className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {dep.departamento}
              </h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 📈 Evolución del proceso */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Evolución del proceso (%)
                  </h3>

                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="cumplimiento"
                        stroke="#16a34a"
                        strokeWidth={2}
                        name="Cumplimiento %"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="estabilidad"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Estabilidad %"
                        dot={{ r: 4 }}
                      />

                      <Line
  type="monotone"
  dataKey="rendimiento"
  stroke="#f59e0b"
  strokeWidth={2}
  name="Rendimiento Tareas %"
  dot={{ r: 4 }}
/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 📊 Volumen operativo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Volumen y novedades
                  </h3>

                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />

                      <Bar
                        dataKey="registros"
                        fill="#64748b"
                        name="Registros"
                      />
                      <Bar
                        dataKey="novedades"
                        fill="#dc2626"
                        name="Novedades"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay resultados */}
      {departamentosFiltrados.length === 0 && departamentosFiltro.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No se encontraron departamentos que coincidan con el filtro seleccionado.</p>
        </div>
      )}
    </div>
  );
}