import { Link } from "react-router-dom";
import { FaPen, FaSearch } from "react-icons/fa";
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Órdenes de Compra</h1>

      <div className="flex mb-4 items-center gap-2">
        <FaSearch />
        <input
          type="text"
          className="border px-3 py-2 rounded w-full"
          placeholder="Buscar orden..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {isLoading && <p>Cargando...</p>}
      {isError && <p className="text-red-500">Error al cargar las órdenes</p>}

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-800 text-white text-sm">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Cliente</th>
              <th className="px-4 py-2 border">Fecha Entrega</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes?.data?.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{orden.id}</td>
                <td className="px-4 py-2 border">{orden.cliente?.nombre}</td>
                <td className="px-4 py-2 border">{orden.fecha_entrega}</td>
                <td className="px-4 py-2 border text-center">
                  {orden.estado.nombre === "Pendiente" ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
                      Pendiente
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                      {orden.estado.nombre}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 border text-center">
                  {orden.orden_trabajo ? (
                    <span className="text-gray-400 text-sm italic">
                      OT generada
                    </span>
                  ) : orden.estado.nombre === "Pendiente" ? (
                    <Link
                    to={`/auth/crm/editar-compra/${orden.id}`}
                    className="inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Editar
                  </Link>
                  
                  ) : (
                    <span className="text-gray-400 text-sm">Bloqueado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <button
          onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
          disabled={pagina === 1}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button
          onClick={() => setPagina((prev) => prev + 1)}
          disabled={pagina === totalPaginas}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
