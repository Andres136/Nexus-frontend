import { useParams, useNavigate } from "react-router-dom"
import { useTrasladosBodega } from "../../../hooks/traslados-bodegas/useTrasladosBodegas";
import { useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Building2,
 
  Calendar,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,

  MapPin,
  Hash,
  MessageSquare,
  
  Box,
  Home,
  ChevronRight,
  RefreshCw,
  Archive
} from 'lucide-react';

const ESTADOS_TRASLADO = {
  'PENDIENTE_BODEGA': { 
    label: 'Pendiente Bodega', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Esperando aprobación de bodega'
  },
  'PENDIENTE_INVENTARIO': { 
    label: 'Pendiente Inventario', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle,
    description: 'Esperando aprobación de inventario'
  },
  'APROBADO': { 
    label: 'Aprobado', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Traslado aprobado y listo para despacho'
  },
  'DESPACHADO': { 
    label: 'Despachado', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package,
    description: 'Productos despachados exitosamente'
  },
  'RECHAZADO_BODEGA': { 
    label: 'Rechazado', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Rechazado por bodega'
  }
};

export default function DetallesTraslados() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTrasladoById, traslado, loading,aprobarInventario,aprobarPorBodega } = useTrasladosBodega();

  useEffect(() => {
    getTrasladoById(id);
  }, [id]);



  const EstadoBadge = ({ estado }) => {
    const config = ESTADOS_TRASLADO[estado] || { 
      label: estado, 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertCircle,
      description: 'Estado desconocido'
    };
    const IconComponent = config.icon;

    return (
      <div className="group relative">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
          <IconComponent className="w-4 h-4 mr-2" />
          {config.label}
        </span>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {config.description}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-3" />
          <span className="text-gray-600">Cargando detalles del traslado...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <button 
                onClick={() => navigate('/traslados/bodegas')}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Traslados
              </button>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <span className="text-sm font-medium text-indigo-600">
                {traslado?.codigo || `#${id}`}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {traslado ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Package className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Traslado {traslado.codigo}
                  </h1>
                  <p className="text-gray-600">Detalle completo del traslado entre bodegas</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <EstadoBadge estado={traslado.estado} />
                
                {traslado.pdf_path && (
                  <a
                    href={`/storage/${traslado.pdf_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Detalles del Traslado */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="flex items-center text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                    Información del Traslado
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Información básica */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Código:</span>
                          <p className="font-medium text-gray-900">{traslado.codigo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Archive className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Estado:</span>
                          <div className="mt-1">
                            <EstadoBadge estado={traslado.estado} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Fecha de Creación:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(traslado.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Fecha de Actualización:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(traslado.updated_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {traslado.observaciones && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">Observaciones:</span>
                          <p className="text-sm text-gray-600 mt-1">{traslado.observaciones}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!traslado.observaciones && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center text-gray-500">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span className="text-sm">Sin observaciones</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos del Traslado */}
              {traslado?.detalles && traslado.detalles.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="flex items-center text-lg font-semibold text-gray-900">
                      <Box className="w-5 h-5 mr-2 text-indigo-500" />
                      Productos del Traslado
                      <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                        {traslado.detalles.length}
                      </span>
                    </h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Cantidad
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {traslado.detalles.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Hash className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                  {item.producto.code || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Package className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.producto.name}
                                  </div>
                                  {item.producto.description && (
                                    <div className="text-xs text-gray-500">
                                      {item.producto.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                                {Number(item.cantidad).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

 {/*Logica de Aprobacion*/}

 <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
  {traslado.estado === 'PENDIENTE_BODEGA' && (
  <button
    onClick={() => aprobarPorBodega(traslado.id, true)}
    className="px-4 py-2 bg-green-600 text-white rounded-lg"
  >
    Aprobar Bodega
  </button>
)}

{traslado.estado === 'PENDIENTE_INVENTARIO' && (
  <button
    onClick={() => aprobarInventario(traslado.id)}
    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
  >
    Aprobar Inventario
  </button>
)}
  </div>  



                  </div>
                                     

                  {/* Resumen */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total de productos:</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {traslado.detalles.reduce((sum, d) => sum + Number(d.cantidad), 0).toFixed(2)} unidades
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              
              {/* Ruta del Traslado */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                    Ruta del Traslado
                  </h3>
                </div>
                
                <div className="p-6">
                  {/* Bodega Origen */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Bodega Origen</div>
                      <div className="text-lg font-semibold text-blue-600">{traslado.bodega_origen?.nombre}</div>
                    </div>
                  </div>
                  
                  {/* Línea conectora */}
                  <div className="flex justify-center my-4">
                    <div className="flex flex-col items-center">
                      <div className="w-px h-6 bg-gray-300"></div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 transform rotate-90" />
                      <div className="w-px h-6 bg-gray-300"></div>
                    </div>
                  </div>
                  
                  {/* Bodega Destino */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Bodega Destino</div>
                      <div className="text-lg font-semibold text-green-600">{traslado.bodega_destino?.nombre}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen rápido */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl shadow-sm">
                <div className="p-6">
                  <h3 className="flex items-center text-lg font-semibold text-indigo-900 mb-4">
                    <Eye className="w-5 h-5 mr-2" />
                    Resumen Rápido
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-700">Estado actual:</span>
                      <EstadoBadge estado={traslado.estado} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-700">Total productos:</span>
                      <span className="font-semibold text-indigo-900">
                        {traslado.detalles?.length || 0}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-700">Total unidades:</span>
                      <span className="font-semibold text-indigo-900">
                        {traslado.detalles?.reduce((sum, d) => sum + Number(d.cantidad), 0).toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Traslado no encontrado</h3>
          <p className="text-gray-600">El traslado solicitado no existe o no se pudo cargar.</p>
        </div>
      )}
    </div>
  );
}