import { useQuery } from "@tanstack/react-query";
import clienteAxios from "../../config/axios";
import { useState } from "react";
import { DocumentTextIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"; 

export default function OrdenesFacturar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null); 

  // Obtener órdenes a facturar con paginación
  const obtenerOrdenesFacturar = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(
        `/api/ordenes-compra-facturar?page=${currentPage}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      return response.data; 
    } catch (error) {
      console.error("Error al obtener las órdenes a facturar:", error);
      return { data: [], links: {}, last_page: 1 };
    }
  };

  // React Query: Se actualiza cada 60 segundos y cambia con la paginación
  const { data = { data: [], links: {}, last_page: 1 }, isLoading, error } = useQuery({
    queryKey: ["ordenes_facturar", currentPage], 
    queryFn: obtenerOrdenesFacturar,
    refetchInterval: 60000,
  });

  // Filtrar por búsqueda
  const filteredOrdenes = data.data.filter((orden) =>
    orden.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ Header mejorado y responsive */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                Órdenes a Facturar
              </h1>
              <p className="text-gray-600 mt-2">Gestiona las órdenes listas para facturación</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-green-800 font-medium">{filteredOrdenes.length} órdenes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Barra de búsqueda mejorada */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Cargando órdenes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">Error al obtener las órdenes.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ Vista móvil: Cards */}
            <div className="block lg:hidden space-y-4">
              {filteredOrdenes.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron órdenes con ese cliente.</p>
                </div>
              ) : (
                filteredOrdenes.map((orden) => (
                  <div key={orden.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Orden #{orden.id}</h3>
                        <p className="text-gray-600">{orden.cliente.nombre}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Por facturar
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha de Entrega:</span>
                        <span className="font-medium">{orden.fecha_entrega}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-bold text-green-600">
                          ${parseFloat(orden.valor_total).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedOrder(orden)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ✅ Vista desktop: Tabla mejorada */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Entrega
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrdenes.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No se encontraron órdenes con ese cliente.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrdenes.map((orden) => (
                        <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 rounded-full p-2 mr-3">
                                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">#{orden.id}</div>
                                <div className="text-xs text-gray-500">Orden de venta</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{orden.cliente.nombre}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{orden.fecha_entrega}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              ${parseFloat(orden.valor_total).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedOrder(orden)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Paginación mejorada y responsive */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página <span className="font-medium">{currentPage}</span> de{" "}
                  <span className="font-medium">{data.last_page}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, data.last_page))}
                  disabled={currentPage >= data.last_page}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}

        {/* ✅ Modal mejorado y responsive */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Detalles de Orden #{selectedOrder.id}
                  </h2>
                  <p className="text-gray-600 mt-1">Información completa de la orden</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                
                {/* Información general - responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600">Cliente</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.cliente.nombre}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600">Fecha de Entrega</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.fecha_entrega}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-600">Ubicación</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.ubicacion_entrega}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${parseFloat(selectedOrder.valor_total).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Tabla de productos - responsive */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
                  
                  {/* Vista móvil: Cards */}
                  <div className="block lg:hidden space-y-4">
                    {selectedOrder.detalles.map((detalle) => (
                      <div key={detalle.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Item:</span> {detalle.observaciones}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Descripción:</span>{" "}
                            {detalle.largo_cm > 0
                              ? `${Math.trunc(detalle.largo_cm)} x ${Math.trunc(detalle.ancho_cm)} ${detalle.descripcion} CAL ${detalle.calibre}`
                              : `${detalle.descripcion}`}
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div>
                              <span className="text-gray-600">kg Requeridos:</span>
                              <div className="font-semibold">{detalle.cantidad_requerida_kg}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Cantidad:</span>
                              <div className="font-semibold">{detalle.cantidad_enviada}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Valor Unitario:</span>
                              <div className="font-semibold">${parseFloat(detalle.valor_unitario).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Total:</span>
                              <div className="font-bold text-green-600">${parseFloat(detalle.valor_total).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vista desktop: Tabla */}
                  <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente Clb</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">kg Requeridos</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitario</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.detalles.map((detalle) => (
                            <tr key={detalle.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{detalle.observaciones}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {detalle.largo_cm > 0
                                  ? `${Math.trunc(detalle.largo_cm)} x ${Math.trunc(detalle.ancho_cm)} ${detalle.descripcion} CAL ${detalle.calibre}`
                                  : `${detalle.descripcion}`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detalle.cliente_clb}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detalle.cantidad_requerida_kg}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detalle.cantidad_enviada}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                ${parseFloat(detalle.valor_unitario).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-green-600">
                                ${parseFloat(detalle.valor_total).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {selectedOrder.ordenes_trabajo?.length > 0 && (
                  <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Observaciones:</h4>
                    {selectedOrder.ordenes_trabajo.map((orden, index) => (
                      <p key={index} className="text-gray-700">{orden.observaciones}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
