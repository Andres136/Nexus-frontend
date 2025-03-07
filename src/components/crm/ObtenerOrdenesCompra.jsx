
import { useEffect } from "react";
import useSystem from "../../hooks/useSystem";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ObtenerOrdenesCompra() {
 
  const {
    ordenesCompra,
    isLoading,
    isError,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    busquedaOrdenesCompra,
    setBusquedaOrdenesCompra,
    refetchOrdenesCompra, // ✅ Agregar refetch para actualizar los datos
  } = useSystem();

  // 🔹 Llamar `refetch()` cada vez que cambie `busquedaOrdenesCompra`
  useEffect(() => {
    refetchOrdenesCompra();
  }, [busquedaOrdenesCompra]);

  return (
    <>
      {/* Buscador */}
      <div className="flex items-center mb-4">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar orden de compra..."
          className="border px-3 py-2 rounded-lg w-full"
          value={busquedaOrdenesCompra}
          onChange={(e) => setBusquedaOrdenesCompra(e.target.value)}
        />
      </div>

      {/* Manejo de carga y errores */}
      {isLoading && <p className="text-gray-500">Cargando órdenes de compra...</p>}
      {isError && <p className="text-red-500">Error al cargar órdenes de compra</p>}

      {/* Tabla Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse border border-gray-300 shadow-lg">
          <thead className="bg-gray-800 text-white text-sm">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Id</th>
              <th className="border border-gray-300 px-4 py-2">Cliente</th>
              <th className="border border-gray-300 px-4 py-2">Fecha Entrega</th>
              <th className="border border-gray-300 px-4 py-2">Estado</th>
              <th className="border border-gray-300 px-4 py-2">Observaciones</th>
              <th className="border border-gray-300 px-4 py-2">Dirección de Entrega</th>
              <th className="border border-gray-300 px-4 py-2">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {ordenesCompra?.data?.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{orden.id}</td>
                <td className="border border-gray-300 px-4 py-2">{orden.cliente.nombre}</td>
                <td className="border border-gray-300 px-4 py-2">{orden.fecha_entrega}</td>
                <td className="border border-gray-300 px-4 py-2">{orden.estado.nombre}</td>
                <td className="border border-gray-300 px-4 py-2">{orden.observaciones}</td>
                <td className="border border-gray-300 px-4 py-2">{orden.ubicacion_entrega}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    to={`/auth/crm/detalles-compras/${orden.id}`}
                    className="w-full bg-green-700 text-white px-3 py-1 rounded hover:bg-gray-700 text-center block"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex justify-end mt-4 gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              paginaActual === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-green-700"
            }`}
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          >
            Anterior
          </button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            className={`px-4 py-2 rounded-lg ${
              paginaActual === totalPaginas ? "bg-gray-300 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-green-700"
            }`}
            onClick={() => setPaginaActual((prev) => prev + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
