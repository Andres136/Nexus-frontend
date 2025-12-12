import useVSMFlow from "../../hooks/vsm/useVSMFlow";
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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Clock,
  Package,
  TrendingUp,
  Users,
  Truck,
  AlertCircle,
  CheckCircle2,
  Play,
  ArrowRight,
  BarChart3,
  Activity,
  ChevronDown, // ✅ Para colapsar
  ChevronUp,   // ✅ Para expandir
  Eye,         // ✅ Para ver más
  EyeOff       // ✅ Para ver menos
} from "lucide-react";
import { useState } from "react"; // ✅ Para manejar estados de agrupación

export default function VsmFlowDashboard() {
  const { data, loading } = useVSMFlow();
  
  // ✅ Estados para controlar la agrupación por columna
  const [expandedColumns, setExpandedColumns] = useState({
    pendientes: false,
    alistando: false,
    finalizadas: false,
    delivery: false
  });

  // ✅ Número máximo de items a mostrar por defecto
  const MAX_ITEMS_VISIBLE = 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Cargando flujo VSM...</span>
        </div>
      </div>
    );
  }

  // ✅ Configuración de columnas mejorada
  const columns = [
    { 
      title: "Pendientes", 
      key: "pendientes", 
      color: "bg-red-50", 
      borderColor: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: AlertCircle
    },
    { 
      title: "Alistando", 
      key: "alistando", 
      color: "bg-blue-50", 
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: Play
    },
    { 
      title: "Finalizadas", 
      key: "finalizadas", 
      color: "bg-green-50", 
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: CheckCircle2
    },
    { 
      title: "En Ruta", 
      key: "delivery", 
      color: "bg-yellow-50", 
      borderColor: "border-yellow-200",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      icon: Truck
    },
  ];

  // ✅ Función para alternar expansión de columna
  const toggleExpanded = (columnKey) => {
    setExpandedColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // ✅ Función para obtener items visibles
  const getVisibleItems = (items, columnKey) => {
    const isExpanded = expandedColumns[columnKey];
    if (isExpanded || items.length <= MAX_ITEMS_VISIBLE) {
      return items;
    }
    return items.slice(0, MAX_ITEMS_VISIBLE);
  };

  // ✅ Función para agrupar items si son muchos
  const getGroupedItems = (items, columnKey) => {
    const visibleItems = getVisibleItems(items, columnKey);
    const hiddenCount = items.length - visibleItems.length;
    
    return {
      visible: visibleItems,
      hiddenCount,
      hasMore: hiddenCount > 0
    };
  };

  // ✅ Datos para gráficos (sin cambios)
  const chartData = columns.map(col => ({
    name: col.title,
    value: data[col.key].length,
    color: col.key === 'pendientes' ? '#ef4444' : 
           col.key === 'alistando' ? '#3b82f6' :
           col.key === 'finalizadas' ? '#10b981' : '#f59e0b'
  }));

  // ✅ Datos para flujo (sin cambios)
  const flowData = [
    { step: 'Pendientes', cantidad: data.pendientes.length, tiempo: 0 },
    { step: 'Alistando', cantidad: data.alistando.length, tiempo: 2.5 },
    { step: 'Finalizadas', cantidad: data.finalizadas.length, tiempo: 4.8 },
    { step: 'En Ruta', cantidad: data.delivery.length, tiempo: 6.2 }
  ];

  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900">{label}</p>
          <p style={{ color: payload[0].color }}>
            Cantidad: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // ✅ Calcular métricas (sin cambios)
  const totalOT = Object.values(data).flat().length;
  const enProceso = data.alistando.length;
  const completadas = data.finalizadas.length + data.delivery.length;
  const eficiencia = totalOT > 0 ? ((completadas / totalOT) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* Header con métricas (sin cambios) */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                   Flujo VSM
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Visualización del flujo de órdenes de trabajo
                </p>
              </div>
            </div>
          </div>

          {/* Métricas principales (sin cambios) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total OT</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOT}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">{enProceso}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{completadas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                  <p className="text-2xl font-bold text-gray-900">{eficiencia}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Gráficos analíticos (sin cambios) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Distribución por Estado
              </h3>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Proporción del Flujo
              </h3>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'OT']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} iconSize={12} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Flujo de Proceso VSM
              </h3>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={flowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'cantidad' ? `${value} OT` : `${value}h`,
                    name === 'cantidad' ? 'Cantidad' : 'Tiempo Est.'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="cantidad" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="tiempo" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ✅ Columnas VSM mejoradas con agrupación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Tablero VSM - Flujo de Órdenes
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {columns.map((col, colIndex) => {
                const Icon = col.icon;
                const groupedItems = getGroupedItems(data[col.key], col.key);
                
                return (
                  <div key={col.key} className="relative">
                    
                    {/* ✅ Header de columna con indicador de cantidad */}
                    <div className={`${col.color} ${col.borderColor} border-2 rounded-xl p-4 mb-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`${col.iconBg} p-2 rounded-lg`}>
                            <Icon className={`w-4 h-4 ${col.iconColor}`} />
                          </div>
                          <h3 className="font-bold text-gray-900">{col.title}</h3>
                        </div>
                        <span className={`${col.iconBg} ${col.iconColor} px-2 py-1 rounded-full text-sm font-bold`}>
                          {data[col.key].length}
                        </span>
                      </div>
                      
                      {/* ✅ Mostrar si hay items ocultos */}
                      {groupedItems.hasMore && (
                        <div className="text-xs text-gray-600 mt-1">
                          Mostrando {groupedItems.visible.length} de {data[col.key].length}
                        </div>
                      )}
                    </div>

                    {/* Flecha de flujo (sin cambios) */}
                    {colIndex < columns.length - 1 && (
                      <div className="hidden md:block absolute top-8 -right-3 z-10">
                        <div className="bg-blue-600 p-1 rounded-full shadow-lg">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* ✅ Items de la columna con agrupación */}
                    <div className="space-y-3 min-h-[300px]">
                      {data[col.key].length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <Package className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">Sin registros</p>
                        </div>
                      ) : (
                        <>
                          {/* ✅ Items visibles */}
                          {groupedItems.visible.map(item => (
                            <div 
                              key={item.id} 
                              className="bg-white border-2 border-gray-200 hover:border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-900">OT #{item.id}</span>
                                <div className={`w-3 h-3 rounded-full ${
                                  col.key === 'pendientes' ? 'bg-red-400' :
                                  col.key === 'alistando' ? 'bg-blue-400 animate-pulse' :
                                  col.key === 'finalizadas' ? 'bg-green-400' : 'bg-yellow-400'
                                }`}></div>
                              </div>

                              {item.cliente?.nombre && (
                                <p className="text-sm text-gray-600 mb-2 truncate" title={item.cliente.nombre}>
                                  👤 {item.cliente.nombre}
                                </p>
                              )}

                              {/* Estados contextuales (sin cambios) */}
                              {col.key === "alistando" && (
                                <div className="flex items-center gap-1 text-blue-700 text-xs font-medium">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                  En progreso...
                                </div>
                              )}

                              {col.key === "delivery" && (
                                <div className="flex items-center gap-1 text-yellow-700 text-xs font-medium">
                                  <Truck className="w-3 h-3" />
                                  Listo para entregar
                                </div>
                              )}

                              {col.key === "finalizadas" && (
                                <div className="flex items-center gap-1 text-green-700 text-xs font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completado
                                </div>
                              )}

                              {col.key === "pendientes" && (
                                <div className="flex items-center gap-1 text-red-700 text-xs font-medium">
                                  <Clock className="w-3 h-3" />
                                  Esperando inicio
                                </div>
                              )}
                            </div>
                          ))}

                          {/* ✅ Botón para mostrar/ocultar más items */}
                          {groupedItems.hasMore && (
                            <button
                              onClick={() => toggleExpanded(col.key)}
                              className={`w-full p-3 rounded-lg border-2 border-dashed ${col.borderColor} ${col.color} hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${col.iconColor}`}
                            >
                              {expandedColumns[col.key] ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Ver menos
                                  <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Ver {groupedItems.hiddenCount} más
                                  <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          )}

                          {/* ✅ Resumen cuando está colapsado */}
                          {groupedItems.hasMore && !expandedColumns[col.key] && (
                            <div className={`p-3 rounded-lg ${col.color} ${col.borderColor} border text-center`}>
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                <Package className="w-4 h-4" />
                                <span>+{groupedItems.hiddenCount} órdenes más...</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}