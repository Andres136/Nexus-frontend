import  { useState, useMemo } from "react";
import useVSMForecast from "../../hooks/vsm/useVSMForecast";
import VsmSupplyCoverage from "./VsmSupplyCoverage";
import VsmCapacityPanel from "./VsmCapacityPanel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  Briefcase,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function VsmDashboard() {
  const [usuarios, setUsuarios] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { data, loading } = useVSMForecast(usuarios);

  // Cálculos agregados
  const totalHoras = data.reduce((acc, ot) => acc + ot.horas_estimadas, 0);
  const totalSegundos = data.reduce((acc, ot) => acc + ot.segundos_estimados, 0);

  // ✅ Paginación para tabla
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  // ✅ Datos limitados para gráficos (máximo 20 elementos)
  const chartData = useMemo(() => {
    const limitedData = data.slice(0, 20); // Solo los primeros 20
    return limitedData.map((ot, index) => ({
      name: `OT ${ot.orden_trabajo_id}`,
      shortName: `${ot.orden_trabajo_id}`, // Nombre corto para gráficos
      horas: ot.horas_estimadas,
      horasUsuario: ot.horas_estimadas,
      segundos: ot.segundos_estimados,
      cliente: ot.cliente,
      index: index + 1
    }));
  }, [data, usuarios]);

  // ✅ Datos para gráfico de pie (top 10 para mejor visualización)
  const pieData = useMemo(() => {
    const sortedData = [...data]
      .sort((a, b) => b.horas_estimadas - a.horas_estimadas)
      .slice(0, 10); // Solo top 10
    
    return sortedData.map((ot) => ({
      name: `OT ${ot.orden_trabajo_id}`,
      value: ot.horas_estimadas,
      cliente: ot.cliente
    }));
  }, [data]);

  // ✅ Colores para gráficos
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  // ✅ Formato personalizado para tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('horas') ? 'h' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ✅ Componente de paginación
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>Mostrando</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>de {data.length} registros</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`px-3 py-1 rounded border ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : page === '...'
                  ? 'border-transparent cursor-default'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* Header sin cambios */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-5 lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                   Pronóstico VSM
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Análisis y predicción de carga de trabajo
                </p>
              </div>
            </div>

          <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Simular con usuarios:
  </label>

  <input
    type="number"
    min={1}
    max={20}
    value={usuarios}
    onChange={(e) => {
      const val = Number(e.target.value);
      if (val >= 1 && val <= 20) {
        setUsuarios(val);
      }
    }}
    className="w-20 border border-gray-300 rounded-lg px-3 py-2 
               focus:ring-2 focus:ring-blue-500 focus:border-transparent
               text-center font-semibold"
  />

  <p className="text-xs text-gray-500 mt-1">
    Valores permitidos: 1–20
  </p>
</div>

          </div>
        </div>
      </div>

      <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-5 lg:px-6 py-6 space-y-6">
        <VsmCapacityPanel usuarios={usuarios} />
        <VsmSupplyCoverage />
        
        {/* Métricas principales sin cambios */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">OT Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{data.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalHoras.toFixed(2)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Asignados</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Horas / Usuario</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalHoras.toFixed(2)}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Aviso para gráficos con muchos datos */}
        {data.length > 20 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los gráficos muestran solo las primeras 20 OT para mejor visualización. 
                La tabla completa está disponible abajo con {data.length} registros.
              </p>
            </div>
          </div>
        )}

        {/* Grid de gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* ✅ Gráfico de barras mejorado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Horas Estimadas por OT {data.length > 20 && '(Top 20)'}
              </h3>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando gráfico...</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="shortName" // ✅ Usar nombre corto
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0} // ✅ Mostrar todos los ticks
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="horas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ✅ Gráfico de pie mejorado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Distribución de Carga (Top 10)
              </h3>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando gráfico...</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : '' // ✅ Solo mostrar labels > 5%
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}h`, 'Horas']} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconSize={12}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ✅ Gráfico de área mejorado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Carga Acumulada por Usuario
              </h3>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando gráfico...</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11 }} 
                    interval="preserveStartEnd" // ✅ Mejor manejo de intervalos
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="horasUsuario" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ✅ Gráfico de líneas mejorado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Tendencia de Horas por OT
              </h3>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando gráfico...</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11 }} 
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="horas" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }} // ✅ Puntos más pequeños
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ✅ Tabla con paginación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Detalle por Orden de Trabajo
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {data.length} órdenes
                </span>
              </div>
              
              {/* ✅ Info de paginación en header */}
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Cargando datos...</span>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No hay órdenes pendientes.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">OT</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Segundos</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Horas</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Usuarios</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Horas / Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((ot, index) => (
                    <tr 
                      key={ot.orden_trabajo_id} 
                      className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-1.5 rounded-lg">
                            <Briefcase className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-900">
                            {ot.orden_trabajo_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{ot.cliente}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700">{ot.segundos_estimados}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {ot.horas_estimadas}h
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                          {usuarios}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                          {ot.horas_estimadas.toFixed(2)}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ✅ Componente de paginación */}
          {!loading && data.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  );
}
