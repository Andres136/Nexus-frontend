import { FaSearch } from "react-icons/fa";
import useOrdenesTrabajo from "../../hooks/useOrdenesTrabajo";
import { Link } from "react-router-dom";

export default function ObtenerOrdenesTrabajo() {
  const {
    ordenesTrabajo,
    isLoading,
    error,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
  } = useOrdenesTrabajo();

  if (isLoading) return <p>Cargando órdenes de trabajo...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Órdenes de Trabajo</h2>
     

         <div className="flex items-center mb-4">
             <FaSearch className="text-gray-500 mr-2" />
             <input
               type="text"
               placeholder="Buscar orden de compra..."
               className="border px-3 py-2 rounded-lg w-full"
               value={busqueda}
               onChange={(e) => setBusqueda(e.target.value)}
             />
           </div>
   

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Fecha de Entrega</th>
            <th className="px-4 py-3 text-left">Observaciones</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenesTrabajo?.data?.map((orden) => (
            <tr key={orden.id} className="border-t border-gray-300">
              <td className="px-4 py-3">{orden.id}</td>
              <td className="px-4 py-3">{orden.cliente.nombre}</td>
              <td className="px-4 py-3">{orden.fecha_entrega}</td>
                <td className="px-4 py-3">{orden.observaciones}</td>
              <td className="px-4 py-3">{orden.estado.nombre}</td>
              <td className="px-4 py-3">
                <Link
                  to={`/auth/crm/ordenes-trabajo/${orden.id}`}
                  className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Ver Detalles
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPagina(pagina - 1)}
          disabled={!ordenesTrabajo?.prev_page_url}
          className={`px-4 py-2 border rounded ${
            !ordenesTrabajo?.prev_page_url
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Anterior
        </button>

        <span className="px-4 py-2">
          Página {pagina} de {ordenesTrabajo?.last_page}
        </span>

        <button
          onClick={() => setPagina(pagina + 1)}
          disabled={!ordenesTrabajo?.next_page_url}
          className={`px-4 py-2 border rounded ${
            !ordenesTrabajo?.next_page_url
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
