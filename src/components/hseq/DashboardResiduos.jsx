import { useState } from "react";
import Select from "react-select";
import { useGetEstadisticasAnualesResiduos } from "../../hooks/hseq/useGetEstadisticasAnualesResiduos";
import { useSedes } from "../../hooks/useSedes";
import { useGetTipoResiduos } from "../../hooks/hseq/useGetTipoResiduos";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function DashboardResiduos() {
  const { sedes } = useSedes();
  const { data: tipoResiduos } = useGetTipoResiduos();

  const [filtros, setFiltros] = useState({
    anio: new Date().getFullYear(),
    sede_id: null,
    tipo_residuo_id: null,
    search: ""
  });

  const { data, isLoading } = useGetEstadisticasAnualesResiduos(filtros);

 const timeline = Array.isArray(data?.timeline) ? data.timeline : [];

  // 🔹 KPIs
  const totalResiduos = timeline.reduce(
    (acc, item) => acc + (item.total_residuos || 0),
    0
  );

const promedioPerCapita = timeline.length
  ? (timeline.reduce((acc, item) => acc + (item.residuo_per_capita || 0), 0) / timeline.length).toFixed(2)
  : 0;

  const usuarios = timeline[0]?.usuarios || 0;

  return (
    <div className="p-6 space-y-6">
    <h1 className="text-3xl font-bold">Dashboard de Residuos</h1>
      {/* 🔹 FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Sede */}
        <Select
          options={(sedes || []).map(s => ({
            value: s.id,
            label: s.nombre
          }))}
          placeholder="Sede"
          onChange={(opt) =>
            setFiltros(prev => ({
              ...prev,
              sede_id: opt?.value,
              page: 1
            }))
          }
        />

        {/* Tipo Residuo */}
        <Select
          options={(tipoResiduos || []).map(t => ({
            value: t.id,
            label: t.nombre
          }))}
          placeholder="Tipo Residuo"
          onChange={(opt) =>
            setFiltros(prev => ({
              ...prev,
              tipo_residuo_id: opt?.value
            }))
          }
        />

        {/* Año */}
        <input
          type="number"
          value={filtros.anio}
          onChange={(e) =>
            setFiltros(prev => ({
              ...prev,
              anio: e.target.value
            }))
          }
          className="border p-2 rounded"
        />

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar residuo..."
          onChange={(e) =>
            setFiltros(prev => ({
              ...prev,
              search: e.target.value
            }))
          }
          className="border p-2 rounded"
        />
      </div>

      {/* 🔹 KPIs */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="bg-white shadow rounded p-4">
    <h4 className="text-gray-500">Total Residuos</h4>
    <p className="text-2xl font-bold text-emerald-600">
      {totalResiduos}
    </p>
  </div>
  <div className="bg-white shadow rounded p-4">
    <h4 className="text-gray-500">Promedio Mensual</h4>
    <p className="text-2xl font-bold text-blue-600">
      {promedioPerCapita}
    </p>
  </div>
  <div className="bg-white shadow rounded p-4">
    <h4 className="text-gray-500">Usuarios</h4>
    <p className="text-2xl font-bold text-purple-600">
      {usuarios}
    </p>
  </div>
  <div className="bg-white shadow rounded p-4">
    <h4 className="text-gray-500">Per Cápita Anual</h4>
    <p className="text-2xl font-bold text-pink-600">
      {promedioPerCapita}
    </p>
  </div>
</div>

      {/* 🔹 GRÁFICA */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 font-bold">Residuos por Mes</h3>

        {isLoading ? (
          <p>Cargando...</p>
        ) : (
      <ResponsiveContainer width="100%" height={300}>
  <LineChart data={timeline}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="mes" />
    <YAxis />
    <Tooltip />
    <Line
      type="monotone"
      dataKey="total_residuos"
      stroke="#ef4444"
      strokeWidth={2}
      name="Total Residuos"
    />
    <Line
      type="monotone"
      dataKey="residuo_per_capita"
      stroke="#6366f1"
      strokeWidth={2}
      name="Per Cápita"
      dot={{ r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
        )}
      </div>

      {/* 🔹 TABLA */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 font-bold">Detalle de Residuos</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Mes</th>
              <th>Total</th>
              <th>Usuarios</th>
              <th>Per Cápita</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((item) => (
              <tr key={item.mes_num} className="border-b">
                <td>{item.mes}</td>
                <td>{item.total_residuos}</td>
                <td>{item.usuarios}</td>
                <td>{item.residuo_per_capita}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}