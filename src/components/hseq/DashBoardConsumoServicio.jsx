import { useState } from "react";
import Select from "react-select";
import { useGetEstadisticasAnualesServicios } from "../../hooks/hseq/useGetEstadisticasAnualesServicios";
import { useSedes } from "../../hooks/useSedes";
import { useGetTipoServicios } from "../../hooks/hseq/useGetTipoServicios";

// Si usas Recharts (recomendado)
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function DashboardConsumoServicios() {
  const { sedes } = useSedes();
  const { data: tipoServicios } = useGetTipoServicios();

  const [filtros, setFiltros] = useState({
    anio: new Date().getFullYear(),
    sede_id: null,
    tipo_servicio_id: null,
    search: ""
  });

  const { data, isLoading } = useGetEstadisticasAnualesServicios(filtros);

  const timeline = data.timeline || [];

  // KPI
  const totalConsumo = timeline.reduce(
    (acc, item) => acc + (item.total_consumo || 0),
    0
  );

  const promedio = timeline.length
    ? (totalConsumo / timeline.length).toFixed(2)
    : 0;
const promedioAnualPerCapita = timeline.length
  ? (timeline.reduce((acc, item) => acc + (item.consumo_percapita || 0), 0) / timeline.length).toFixed(2)
  : 0;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard de Consumo de Servicios</h1>
      {/* 🔹 FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Sede */}
        <Select
          options={sedes.map(s => ({ value: s.id, label: s.nombre }))}
          placeholder="Sede"
          onChange={(opt) =>
            setFiltros(prev => ({ ...prev, sede_id: opt?.value }))
          }
        />

        {/* Tipo Servicio */}
        <Select
          options={(tipoServicios || []).map(t => ({
            value: t.id,
            label: t.nombre
          }))}
          placeholder="Servicio"
          onChange={(opt) =>
            setFiltros(prev => ({
              ...prev,
              tipo_servicio_id: opt?.value
            }))
          }
        />

        {/* Año */}
        <input
          type="number"
          value={filtros.anio}
          onChange={(e) =>
            setFiltros(prev => ({ ...prev, anio: e.target.value }))
          }
          className="border p-2 rounded"
        />

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar servicio..."
          onChange={(e) =>
            setFiltros(prev => ({ ...prev, search: e.target.value }))
          }
          className="border p-2 rounded"
        />
      </div>

      {/* 🔹 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h4>Total Consumo</h4>
          <p className="text-2xl font-bold">{totalConsumo}</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h4>Promedio Mensual</h4>
          <p className="text-2xl font-bold">{promedio}</p>
        </div>
            <div className="bg-white shadow rounded p-4">
            <h4>Promedio Anual Per Cápita</h4>
            <p className="text-2xl font-bold">{promedioAnualPerCapita}</p>
            </div>

        <div className="bg-white shadow rounded p-4">
          <h4>Usuarios</h4>
          <p className="text-2xl font-bold">
            {timeline[0]?.usuarios || 0}
          </p>
        </div>
      </div>

      {/* 🔹 GRÁFICA */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 font-bold">Consumo por Mes</h3>

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
      dataKey="total_consumo"
      stroke="#10b981"
      name="Total Consumo"
    />
    <Line
      type="monotone"
      dataKey="consumo_percapita"
      stroke="#6366f1"
      name="Consumo Per Cápita"
      dot={{ r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
        )}
      </div>

      {/* 🔹 TABLA */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 font-bold">Detalle</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>Mes</th>
              <th>Consumo</th>
              <th>Usuarios</th>
              <th>Per Cápita</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((item) => (
              <tr key={item.mes_num} className="border-b">
                <td>{item.mes}</td>
                <td>{item.total_consumo}</td>
                <td>{item.usuarios}</td>
                <td>{item.consumo_percapita}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}