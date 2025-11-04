import { useState, useEffect } from "react";
import { useOrdenesFaltantes } from "../../hooks/useOrdenesFaltantes";
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  AlertCircle, 
  User,
  Loader2 
} from "lucide-react";

export default function AlertStock() {
  const { ordenes, isLoading, error } = useOrdenesFaltantes();

  const [animateCards, setAnimateCards] = useState(false);

  // ✅ Animar las tarjetas cuando los datos se cargan
  useEffect(() => {
    if (ordenes && ordenes.length > 0) {
      setAnimateCards(true);
    }
  }, [ordenes]);

  // ✅ Estado de carga
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600 mr-2" />
          <span className="text-gray-600">Cargando estadísticas de stock...</span>
        </div>
      </div>
    );
  }

  // ✅ Estado de error
  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">Error al cargar las estadísticas</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Calculado de estadísticas con validación
  const totalOrdenes = ordenes?.length || 0;
  const totalFaltantes = ordenes?.reduce((sum, o) => sum + (o.faltantes_total || 0), 0) || 0;
  const productosAfectados = ordenes?.reduce((sum, o) => sum + (o.faltantes?.length || 0), 0) || 0;
  const clientesAfectados = ordenes?.length > 0 
    ? new Set(ordenes.map(o => o.cliente?.id).filter(Boolean)).size 
    : 0;

  return (
    <div className="mb-8">
      {/* ✅ Header con animación */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="bg-red-100 p-3 rounded-full animate-pulse">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Alerta de Stock
          </h1>
          <p className="text-gray-600">
            Monitoreo en tiempo real de órdenes con faltantes de inventario
          </p>
        </div>
      </div>

      {/* ✅ Estadísticas rápidas con animación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Órdenes */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-500 hover:shadow-md ${
          animateCards ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrdenes}</p>
              <p className="text-xs text-gray-500">con faltantes</p>
            </div>
          </div>
        </div>
        
        {/* Total Faltantes */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-500 hover:shadow-md ${
          animateCards ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Faltantes</p>
              <p className="text-2xl font-bold text-red-600">{totalFaltantes}</p>
              <p className="text-xs text-gray-500">productos</p>
            </div>
          </div>
        </div>

        {/* Productos Afectados */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-500 hover:shadow-md ${
          animateCards ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Productos Afectados</p>
              <p className="text-2xl font-bold text-yellow-600">{productosAfectados}</p>
              <p className="text-xs text-gray-500">únicos</p>
            </div>
          </div>
        </div>

        {/* Clientes Afectados */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-500 hover:shadow-md ${
          animateCards ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Clientes Afectados</p>
              <p className="text-2xl font-bold text-purple-600">{clientesAfectados}</p>
              <p className="text-xs text-gray-500">únicos</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mensaje cuando no hay datos */}
      {totalOrdenes === 0 && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">
              ¡Excelente! No hay órdenes con faltantes de stock en este momento.
            </span>
          </div>
        </div>
      )}


    </div>
  );
}