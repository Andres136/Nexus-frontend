import { useEstadisticasSemanalCartera } from "../../hooks/crm/useEstadisticasSemanalCartera";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import NexusLoader from "../NexusLoader";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const esActual = payload[0].payload.es_actual;
    return (
      <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-100">
        <p className="text-xs font-medium text-gray-500">
          {label} {esActual && <span className="text-green-500">(Actual)</span>}
        </p>
        <p className="text-sm font-bold text-indigo-600">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// Punto personalizado para resaltar semana actual
const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.es_actual) {
    return (
      <g>
        {/* Círculo pulsante de fondo */}
        <circle cx={cx} cy={cy} r={8} fill="#22c55e" fillOpacity={0.3}>
          <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="fillOpacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Punto principal */}
        <circle cx={cx} cy={cy} r={5} fill="#22c55e" stroke="#fff" strokeWidth={2} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="#6366f1" />;
};

export default function ObtenerRecaudoCarteraSemanal() {
  const { data, error, isLoading } = useEstadisticasSemanalCartera();
  
  const semanaActual = data?.semana_actual;
  
  const chartData = data?.timeline?.map((item) => ({
    semana: `S${item.semana}`,
    total: item.total,
    es_actual: item.es_actual,
  })) || [];

  const totalRecaudo = chartData.reduce((acc, item) => acc + item.total, 0);
  const recaudoActual = chartData.find(item => item.es_actual)?.total || 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-64">
        <NexusLoader text="Cargando datos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 h-64 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-500 font-medium">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Recaudo Semanal</h3>
            <p className="text-xs text-gray-400">Cartera por semana</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          {/* Semana actual badge */}
          <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-green-700">Semana {semanaActual}</span>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-400">Esta semana</p>
            <p className="text-sm font-bold text-green-600">${recaudoActual.toLocaleString()}</p>
          </div>
          
          <div className="text-right border-l pl-4">
            <p className="text-xs text-gray-400">Total año</p>
            <p className="text-lg font-bold text-indigo-600">${totalRecaudo.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="semana" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(value) => `$${(value / 1000)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Línea vertical en semana actual */}
          <ReferenceLine 
            x={`S${semanaActual}`} 
            stroke="#22c55e" 
            strokeDasharray="4 4" 
            strokeWidth={1.5}
          />
          
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#6366f1" 
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-indigo-500 rounded"></span>
          <span>Recaudo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Semana actual</span>
        </div>
      </div>
    </div>
  );
}