import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import { useEstadisticasCartera } from "../../hooks/crm/useEstsdisticasCartera";

const meses = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function CarteraEstadisticas() {

  const {
    timeline,
    total_vencido,
    total_cartera,
    porcentaje_vencido,
    isLoading
  } = useEstadisticasCartera(new Date().getFullYear());

  if (isLoading) return <p>Cargando estadísticas...</p>;

  const data = timeline.map(item => ({
    mes: meses[item.mes],
    total: Number(item.total)
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-lg font-semibold mb-4">
        Cartera vencida mensual
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="mes" />

          <YAxis />

          <Tooltip
            formatter={(value) =>
              `$${Number(value).toLocaleString()}`
            }
          />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4 }}
          />

        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">

        <div>
          <p className="text-gray-500 text-sm">Total cartera</p>
          <p className="font-bold text-lg">
            ${Number(total_cartera).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Cartera vencida</p>
          <p className="font-bold text-lg text-red-600">
            ${Number(total_vencido).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">% vencido</p>
          <p className="font-bold text-lg text-yellow-600">
            {porcentaje_vencido}%
          </p>
        </div>

      </div>

    </div>
  );
}