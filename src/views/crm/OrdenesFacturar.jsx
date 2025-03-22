import { useQuery } from "@tanstack/react-query";
import clienteAxios from "../../config/axios";
import { useState } from "react";
import { DocumentTextIcon, EyeIcon, XMarkIcon } from "@heroicons/react/24/solid"; 

export default function OrdenesFacturar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null); // Para ver detalles de una orden

  // Obtener órdenes a facturar con paginación
  const obtenerOrdenesFacturar = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(
        `/api/ordenes-compra-facturar?page=${currentPage}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✔ Órdenes a facturar:", response.data);
      return response.data; 
    } catch (error) {
      console.error("Error al obtener las órdenes a facturar:", error);
      return { data: [], links: {} };
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        📑 Órdenes a Facturar
      </h1>

      {/* Input de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
      />

      {isLoading ? (
        <p className="text-center text-gray-500">Cargando órdenes...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Error al obtener las órdenes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-800 text-white uppercase text-sm">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Cliente</th>
                <th className="py-3 px-6 text-left">Fecha de Entrega</th>
                <th className="py-3 px-6 text-left">Total</th>
                <th className="py-3 px-6 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredOrdenes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No se encontraron órdenes con ese cliente.
                  </td>
                </tr>
              ) : (
                filteredOrdenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6">{orden.id}</td>
                    <td className="py-3 px-6">{orden.cliente.nombre}</td>
                    <td className="py-3 px-6">{orden.fecha_entrega}</td>
                    <td className="py-3 px-6 font-semibold">
                      ${parseFloat(orden.valor_total).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 flex space-x-3">
                      {/* Botón para ver detalles */}
                      <button
                        className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                        onClick={() => setSelectedOrder(orden)}
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span>Detalles</span>
                      </button>

                      {/* Botón para facturar */}
                    
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              ◀️ Anterior
            </button>
            <span className="text-gray-700 font-semibold">
              Página {currentPage} de {data.last_page}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, data.last_page))}
              disabled={currentPage >= data.last_page}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Siguiente ▶️
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles con tabla y scroll */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-5xl w-full">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Detalles de Orden #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)}>
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </button>
            </div>
            <p><strong>Cliente:</strong> {selectedOrder.cliente.nombre}</p>
            <p><strong>Fecha de Entrega:</strong> {selectedOrder.fecha_entrega}</p>
            <p><strong>Ubicación Entrega:</strong> {selectedOrder.ubicacion_entrega}</p>
            <p><strong>Total:</strong> ${parseFloat(selectedOrder.valor_total).toLocaleString()}</p>
            
            <h3 className="mt-4 text-lg font-semibold">Productos:</h3>
            <div className="max-h-64 overflow-y-auto">
            <table className="w-full border border-gray-300">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Descripción</th>
                <th className="px-4 py-2">Cliente Clb</th>
                <th className="px-4 py-2">kg Requeridos</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Valor Unitario</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.detalles.map((detalle) => (
                <tr key={detalle.id} className="border-t">
                    <td className="px-4 py-2">{detalle.observaciones}</td>
                  <td className="px-4 py-2">
                    {Math.trunc (detalle.largo_cm)} x { Math.trunc (detalle.ancho_cm)}  {detalle.descripcion}   CAL  {detalle.calibre} {/* Eliminamos decimales */}
                  </td>
                    <td className="px-4 py-2">{detalle.cliente_clb}</td>
                  <td className="px-4 py-2">{detalle.cantidad_requerida_kg}</td>
                  <td className="px-4 py-2">{detalle.cantidad}</td>
                  <td className="px-4 py-2">${parseFloat(detalle.valor_unitario).toLocaleString()}</td>
                  <td className="px-4 py-2">${parseFloat(detalle.valor_total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

            </div>
         {/* Observaciones */}
 {/* Observaciones de Orden de Trabajo */}
 {selectedOrder.ordenes_trabajo?.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 border-l-4 border-gray-500">
            <strong>Observaciones:</strong>{" "}
            {selectedOrder.ordenes_trabajo.map((orden, index) => (
              <p key={index}>{orden.observaciones}</p>
            ))}
          </div>
        )}
       

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
