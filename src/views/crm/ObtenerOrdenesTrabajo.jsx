import { FaSearch } from "react-icons/fa";
import useOrdenesTrabajo from "../../hooks/useOrdenesTrabajo";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function ObtenerOrdenesTrabajo() {
  const {
    ordenesTrabajo,
    isLoading,
    error,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
    fecha,
  setFecha,
  sede,
  setSede,
  } = useOrdenesTrabajo();
  const limpiarFiltros = () => {
    setBusqueda("");
    setFecha("");
    setSede("");
    // Reiniciar la página a 1 al limpiar los filtros
    // Esto es importante para que al limpiar los filtros, la paginación vuelva a la primera página
    // y no se quede en una página que no tiene resultados
    setPagina(1);
  };
  
useEffect(() => {
  setPagina(1);
}, [busqueda, fecha]);

// ...existing code...
if (isLoading)
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg
        className="animate-spin h-8 w-8 text-blue-600 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      <span className="text-blue-700 font-semibold">Cargando órdenes de trabajo...</span>
    </div>
  );
// ...existing code...
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6 bg-white rounded-xl">

      <div className="grid grid-cols-2 gap-4">
   <h2 className="text-2xl font-bold mb-4">Órdenes de Trabajo</h2>
     

   <div className="flex items-center gap-4 mb-4">
  <div className="flex items-center w-full">
    <FaSearch className="text-gray-500 mr-2" />
    <input
      type="text"
      placeholder="Buscar por cliente..."
      autoFocus
      className="border px-3 py-2 rounded-lg w-full"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
    />
  </div>

  <div className="w-full">
    <input
      type="date"
      className="border px-3 py-2 rounded-lg w-full"
      value={fecha}
      onChange={(e) => setFecha(e.target.value)}
    />
  </div>
  <button
    onClick={limpiarFiltros}
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
  >
    Limpiar
  </button>
</div>


       

           <table className=" col-span-2 w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Fecha de Entrega</th>
            <th className="px-4 py-3 text-left">Fecha Creacion</th>
         <th className="px-4 py-3 text-left">Sede</th>
           <th className="px-4 py-3 text-left">Direcion de Entrega</th>
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
           <td className="px-4 py-3">
  {new Date(orden.created_at).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })}
</td>

              <td className="px-4 py-3">{orden?.orden_compra?.sede?.nombre || "Sin sede"}</td>


              <td className="px-4 py-3"> {orden?.orden_compra?.ubicacion_entrega || "No especificado"}</td>
                <td className="px-4 py-3">{orden.observaciones}</td>
                <td className="px-4 py-3">
  {orden.estado.nombre === "Pendiente" ? (
    <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-semibold">
      Pendiente
    </span>
  ) : orden.estado.nombre === "Completado" ? (
    <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
      Completado
    </span>
  ) : (
    <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
      {orden.estado.nombre}
    </span>
  )}
</td>

              <td className="px-4 py-3">
                <Link
                  to={`/auth/crm/ordenes-trabajo/${orden.id}`}
                  className="w-full bg-gray-800 text-white px-2 py-2 rounded hover:bg-green-700"
                >
                  Detalles
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    
      </div>

     
   

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
