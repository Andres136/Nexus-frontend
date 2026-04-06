import { useState, useMemo } from "react"
import { useGetProductividadIndividual } from "../../hooks/vsm/UseGetProductividaIndividual"
import { useSedes } from "../../hooks/useSedes"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts"

const estadoColors = {
  "BAJO": "bg-red-100 text-red-700 border-red-300",
  "NORMAL": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "EFICIENTE": "bg-green-100 text-green-700 border-green-300"
}

export default function DashboardProductividaIndividual() {
  const [filters, setFilters] = useState({
    sede_id: null,
    fecha_inicio: '',
    fecha_fin: ''
  })

  const { sedes } = useSedes()
  const { data = [], isLoading } = useGetProductividadIndividual(filters)

const handleChange = (e) => {
  const value = e.target.value === "" ? null : e.target.value;

  setFilters({
    ...filters,
    [e.target.name]: value
  });
};

  // KPIs
  const totalProduccion = useMemo(() => data.reduce((acc, i) => acc + i.produccion_total, 0), [data])
  const promedioEficiencia = useMemo(() =>
    data.length ? (data.reduce((acc, i) => acc + i.eficiencia_porcentaje, 0) / data.length).toFixed(2) : 0, [data]
  )

  // Colores para barras según estado
  const getBarColor = (estado) => {
    if (estado === "EFICIENTE") return "#22c55e"
    if (estado === "NORMAL") return "#eab308"
    return "#ef4444"
  }

  return (
    <div className="p-6 space-y-6">

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4">
        <select name="sede_id" onChange={handleChange} className="border p-2 rounded min-w-[180px]">
          <option value="">Todas las sedes</option>
          {sedes?.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        <input type="date" name="fecha_inicio" onChange={handleChange} className="border p-2 rounded"/>
        <input type="date" name="fecha_fin" onChange={handleChange} className="border p-2 rounded"/>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded flex flex-col items-center">
          <span className="text-gray-500">Producción Total</span>
          <span className="text-3xl font-bold text-green-600">{totalProduccion}</span>
        </div>
        <div className="bg-white shadow p-4 rounded flex flex-col items-center">
          <span className="text-gray-500">Promedio Eficiencia</span>
          <span className="text-3xl font-bold text-blue-600">{promedioEficiencia}%</span>
        </div>
        <div className="bg-white shadow p-4 rounded flex flex-col items-center">
          <span className="text-gray-500">Usuarios</span>
          <span className="text-3xl font-bold text-purple-600">{data.length}</span>
        </div>
      </div>

      {/* GRÁFICA EFICIENCIA */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2 font-semibold">Eficiencia por Usuario</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="eficiencia_porcentaje">
              {data.map((entry, idx) => (
                <Cell key={entry.usuario_id} fill={getBarColor(entry.estado)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICA PRODUCCIÓN */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-2 font-semibold">Producción por Usuario</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="produccion_total">
              {data.map((entry, idx) => (
                <Cell key={entry.usuario_id} fill={getBarColor(entry.estado)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto max-h-[400px]">
        <table className="w-full text-center">
          <thead>
            <tr className="border-b">
              <th>Usuario</th>
              <th>Producción</th>
              <th>Horas</th>
              <th>Bolsas/Hora</th>
              <th>Eficiencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.usuario_id} className="border-t">
                <td>{item.nombre}</td>
                <td>{item.produccion_total}</td>
                <td>{item.horas}</td>
                <td>{item.bolsas_por_hora}</td>
                <td>{item.eficiencia_porcentaje}%</td>
                <td>
                  <span className={`inline-block px-2 py-1 rounded border text-xs font-semibold ${estadoColors[item.estado] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></span>
          <span className="ml-2">Cargando...</span>
        </div>
      )}
    </div>
  )
}