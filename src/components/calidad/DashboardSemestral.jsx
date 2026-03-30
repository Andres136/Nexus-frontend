import { useGetEstadisticasSemestral } from "../../hooks/calidad/useGetEstadisticasSemestral";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardSemestral() {
  const {
    data: estadisticas = {},
    isLoading,
    error,
  } = useGetEstadisticasSemestral();

  if (isLoading) return <p>Cargando dashboard...</p>;
  if (error) return <p>Error al cargar datos</p>;

  const chartData = [
    { name: "Cerradas", value: estadisticas.cerradas },
    { name: "En proceso", value: estadisticas.en_proceso },
    { name: "Abiertas", value: estadisticas.abiertas },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <BarChart3 />
        <h1 className="text-2xl font-bold">Dashboard de Calidad</h1>
      </div>

      {/* KPI PRINCIPAL */}
      <div className="bg-white shadow rounded-xl p-6 text-center">
        <p className="text-gray-500">Cumplimiento Semestral</p>

        <h1
          className={`text-5xl font-bold ${
            estadisticas.porcentaje >= 70
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {estadisticas.porcentaje}%
        </h1>

        <p className="text-sm text-gray-400">
          {estadisticas.fecha_inicio} → {estadisticas.fecha_fin}
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500">Total</p>
          <h2 className="text-2xl font-bold">{estadisticas.total}</h2>
        </div>

        <div className="bg-green-50 p-4 rounded-xl shadow text-center">
          <p className="text-green-700">Cerradas</p>
          <h2 className="text-2xl font-bold text-green-700">
            {estadisticas.cerradas}
          </h2>
        </div>

        <div className="bg-red-50 p-4 rounded-xl shadow text-center">
          <p className="text-red-700">Abiertas</p>
          <h2 className="text-2xl font-bold text-red-700">
            {estadisticas.abiertas}
          </h2>
        </div>

      </div>

      {/* GRÁFICA */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="mb-4 font-semibold">Distribución de Novedades</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}