import { useState } from "react";
import Select from "react-select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useEstadisticasDashboard } from "../../hooks/RegistroDiario/useEstadisticasDashboard";

export default function DashboardRegistroDiario() {
  const { data, loading } = useEstadisticasDashboard();

  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [departamentosFiltro, setDepartamentosFiltro] = useState([]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const todosDepartamentos = data.departamentos.map(dep => ({
    value: dep.departamento_id,
    label: dep.departamento
  }));

  const departamentosFiltrados =
    departamentosFiltro.length === 0
      ? data.departamentos
      : data.departamentos.filter(dep =>
          departamentosFiltro.some(
            filtro => filtro.value === dep.departamento_id
          )
        );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Dashboard Incidentes Operativos
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

            <div className="flex-1 lg:min-w-[300px]">
              <Select
                isMulti
                placeholder="Filtrar departamentos..."
                options={todosDepartamentos}
                value={departamentosFiltro}
                onChange={(selectedOptions) =>
                  setDepartamentosFiltro(selectedOptions || [])
                }
              />
            </div>

            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[anioActual, anioActual - 1, anioActual - 2].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {departamentosFiltro.length > 0 && (
              <button
                onClick={() => setDepartamentosFiltro([])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Departamentos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {departamentosFiltrados.map(dep => {

          const chartData = dep.meses.map(m => ({
            mes: m.nombre_mes,
            total: m.total_registros,
            verificados: m.verificados,
            pendientes: m.pendientes,
          }));

          const totalIncidentes = dep.meses.reduce(
            (sum, m) => sum + m.total_registros,
            0
          );

          const totalVerificados = dep.meses.reduce(
            (sum, m) => sum + m.verificados,
            0
          );

          const totalPendientes = dep.meses.reduce(
            (sum, m) => sum + m.pendientes,
            0
          );

        

          return (
            <div
              key={dep.departamento_id}
              className="bg-white rounded-lg shadow-sm border border-gray-100"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-medium text-gray-800">
                  {dep.departamento}
                </h2>
              </div>

              <div className="p-6 space-y-6">

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-3">

                  <KPI
                    label="Incidentes"
                    value={totalIncidentes}
                    color="blue"
                  />

                  <KPI
                    label="Verificados"
                    value={totalVerificados}
                    color="green"
                  />

                  <KPI
                    label="Pendientes"
                    value={totalPendientes}
                    color="yellow"
                  />

           

                </div>

                {/* Incidentes por mes */}
                <div className="bg-gray-50 rounded-lg p-4">

                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    Incidentes por mes
                  </h3>

                  <ResponsiveContainer width="100%" height={220}>

                    <BarChart data={chartData}>

                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />

                      <YAxis tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Legend />

                      <Bar
                        dataKey="total"
                        name="Incidentes"
                        fill="#ef4444"
                      />

                      <Bar
                        dataKey="verificados"
                        name="Verificados"
                        fill="#10b981"
                      />

                      <Bar
                        dataKey="pendientes"
                        name="Pendientes"
                        fill="#f59e0b"
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {departamentosFiltrados.length === 0 &&
        departamentosFiltro.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              No se encontraron departamentos para el filtro seleccionado.
            </p>
          </div>
        )}
    </div>
  );
}

function KPI({ label, value, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-3 text-center`}>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}