import { useState } from "react"
import { useEstadisticasTicMensual } from "../../hooks/tic/useEstadisticasTicMensual"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { BarChart3 } from "lucide-react"

const meses = [
  '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

export default function EstadisticasMensalTic() {
  const [year, setYear] = useState(new Date().getFullYear())
  const { data, isLoading } = useEstadisticasTicMensual(year)

  // Rellenar los 12 meses
  const dataCompleta = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const found = data?.find(d => d.mes === mes)

    return {
      mes: meses[mes],
      total: found ? Number(found.total) : 0,
      completados: found ? Number(found.completados) : 0,
      porcentaje: found ? Number(found.porcentaje_cumplimiento) : 0,
    }
  })

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Mantenimientos Anuales
          </h2>
        </div>

        {/* FILTRO AÑO */}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <p className="text-gray-500">Cargando...</p>
        </div>
      )}

      {/* GRAFICA */}
      {!isLoading && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dataCompleta}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            />
            
            <Legend />

            {/* Línea total */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Total"
            />

            {/* Línea completados */}
            <Line
              type="monotone"
              dataKey="completados"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Completados"
            />

            {/* Línea porcentaje */}
            <Line
              type="monotone"
              dataKey="porcentaje"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="% Cumplimiento"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}