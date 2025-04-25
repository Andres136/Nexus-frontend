import { useProveedores } from "../../hooks/useProveedores";
import {  Link, useNavigate } from "react-router-dom";

export default function ObtenerOrdenesProveedores() {
  const navigate = useNavigate();
  const {
    ordenes,
    loading,
    pagina,
    lastPage,
    setPagina,
    obtenerOrdenes,
    searchTerm,
    setSearchTerm,
  } = useProveedores();

  const handleBuscar = () => {
    setPagina(1);
    obtenerOrdenes(1, searchTerm);
  };
  console.log(ordenes);
  return (
    <div className="grid grid-cols-1 ">

      <div className="col-span-1">
      <h2 className="text-2xl font-bold mb-4">Órdenes de Compra Proveedores</h2>
      <Link
        to="/auth/crm/proveedores"
        className="m-4 inline-block bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 text-sm "
      >
        ← Volver
      </Link>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          placeholder="Buscar por número de orden o proveedor..."
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleBuscar}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Número O-C</th>
              <th className="border px-4 py-2">Fecha </th>

              <th className="border px-4 py-2">Proveedor</th>
              <th className="border px-4 py-2">Estado</th>
              <th className="border px-4 py-2">Usuario</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.data?.map((orden) => (
              <tr key={orden.id}>
                <td className="border px-4 py-2">{orden.numero_orden}</td>
                <td className="border px-4 py-2">{orden.fecha}</td>
                <td className="border px-4 py-2">{orden.proveedor?.nombre}</td>
                <td className="border px-4 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      orden.estado.nombre === "Pendiente"
                        ? "bg-red-100 text-red-800"
                        : orden.estado.nombre === "Completado"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {orden.estado.nombre}
                  </span>
                </td>

                <td className="border px-4 py-2">{orden.usuario?.name}</td>
                <td className="border px-4 py-2 flex gap-2 justify-center">
                  <button
                    onClick={() =>
                      navigate(
                        `/auth/crm/ordenes-proveedor-entregas/${orden.id}/registrar-entrega`
                      )
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Registrar Entrega
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 flex justify-between">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Anterior
        </button>
        <span>
          Página {pagina} de {lastPage}
        </span>
        <button
          disabled={pagina === lastPage}
          onClick={() => setPagina(pagina + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Siguiente
        </button>
      </div>
      </div>
    </div>
  );
}
