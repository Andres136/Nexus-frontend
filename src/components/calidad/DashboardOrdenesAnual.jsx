import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { ordenesCompraProveedoresApi } from "../../services/api";
import { ArrowLeft, Calendar, TrendingUp, Package, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardOrdenesAnual() {
  const [data, setData] = useState([]);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await ordenesCompraProveedoresApi.estadisticasOrdenes({ anio });

        setData(res.data.resumen_mensual || []);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [anio]);

  const totalOrdenes = data.reduce((s, m) => s + m.ordenes_totales, 0);
  const totalCompletadas = data.reduce((s, m) => s + m.ordenes_completadas, 0);
  const porcentajeGlobal = totalOrdenes > 0
    ? Math.round((totalCompletadas / totalOrdenes) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Estadísticas de Órdenes
                </h1>
                <p className="text-gray-600 text-sm">Resumen anual {anio}</p>
              </div>
            </div>
          </div>

          {/* Selector de año */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[anio, anio - 1, anio - 2, anio - 3].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Órdenes" 
            value={totalOrdenes} 
            icon={Package}
            color="blue" 
          />
          <KpiCard 
            title="Completadas" 
            value={totalCompletadas} 
            icon={CheckCircle}
            color="green" 
          />
          <KpiCard 
            title="Pendientes" 
            value={totalOrdenes - totalCompletadas} 
            icon={Clock}
            color="orange" 
          />
          <KpiCard 
            title="% Cumplimiento" 
            value={`${porcentajeGlobal}%`} 
            icon={TrendingUp}
            color="emerald" 
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico de barras */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Órdenes Mensuales</h3>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="mes_nombre" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="ordenes_totales" 
                  fill="#3b82f6" 
                  name="Totales"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="ordenes_completadas" 
                  fill="#10b981" 
                  name="Completadas"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de línea */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Tendencia de Cumplimiento</h3>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="mes_nombre" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  formatter={(value) => [`${value}%`, 'Cumplimiento']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="porcentaje_cumplimiento"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="% Cumplimiento"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      

      </div>
    </div>
  );
}

/* KPI Card mejorada */
function KpiCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-900",
      icon: "text-blue-600",
      border: "border-blue-200"
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-900",
      icon: "text-green-600",
      border: "border-green-200"
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-900",
      icon: "text-orange-600",
      border: "border-orange-200"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-900",
      icon: "text-emerald-600",
      border: "border-emerald-200"
    }
  };

  const colorScheme = colors[color];

  return (
    <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colorScheme.text} opacity-80`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${colorScheme.text} mt-1`}>
            {value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${colorScheme.icon}`} />
      </div>
    </div>
  );
}