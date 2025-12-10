import { Link } from "react-router-dom";
import { FaPen, FaSearch } from "react-icons/fa";
import { Package, Calendar, User, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import useMisOrdenesCompra from "../../hooks/useMisOrdenesCompra";

export default function MisOrdenesComerciales() {
  const {
    ordenes,
    isLoading,
    isError,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    totalPaginas,
  } = useMisOrdenesCompra();
  
  console.log(ordenes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* ✅ Header mejorado */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Mis Órdenes de Compra
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gestión y seguimiento de órdenes comerciales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ✅ Barra de búsqueda mejorada */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaSearch className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar orden
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder-gray-500"
                placeholder="Buscar por ID, cliente, fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ✅ Estados de carga y error mejorados */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Cargando órdenes...</p>
            <p className="text-sm text-gray-500 mt-1">Por favor espera un momento</p>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 font-semibold mb-2">Error al cargar las órdenes</p>
            <p className="text-sm text-gray-600">Por favor, intenta recargar la página</p>
          </div>
        )}

        {/* ✅ Tabla mejorada */}
        {!isLoading && !isError && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header de la tabla */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lista de Órdenes
                  </h2>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  {ordenes.length} órdenes
                </span>
              </div>
            </div>

            {/* Tabla responsive */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <span>#</span>
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Cliente</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Fecha Entrega</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ordenes.map((orden, index) => (
                    <tr 
                      key={orden.id} 
                      className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">#{orden.id}</div>
                            <div className="text-xs text-gray-500">Orden {index + 1}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 p-1 rounded-full">
                            <User className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {orden.cliente?.nombre || 'Sin cliente'}
                            </div>
                            <div className="text-xs text-gray-500">Cliente</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-100 p-1 rounded-full">
                            <Calendar className="w-3 h-3 text-yellow-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{orden.fecha_entrega}</div>
                            <div className="text-xs text-gray-500">Fecha límite</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        {orden.estado.nombre === "Pendiente" ? (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Pendiente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {orden.estado.nombre}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/auth/crm/editar-compra/${orden.id}`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Estado vacío mejorado */}
            {ordenes.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay órdenes disponibles
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  No se encontraron órdenes de compra que coincidan con tu búsqueda.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ✅ Paginación mejorada */}
        {!isLoading && !isError && ordenes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span>
                  Mostrando página <span className="font-semibold text-gray-900">{pagina}</span> de{" "}
                  <span className="font-semibold text-gray-900">{totalPaginas}</span>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                  disabled={pagina === 1}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                    {pagina}
                  </span>
                  <span className="text-gray-400 px-1">/</span>
                  <span className="text-gray-600 text-sm">{totalPaginas}</span>
                </div>
                
                <button
                  onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
                  disabled={pagina === totalPaginas}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}