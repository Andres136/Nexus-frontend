import { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import useMisCotizaciones from "../../hooks/useMisCotizaciones";

export default function MisCotizaciones() {
  const {
    cotizaciones,
    isLoading,
    isError,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    totalPaginas,
  } = useMisCotizaciones();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Cotizaciones</h1>

      <div className="flex mb-4 items-center gap-2">
        <FaSearch />
        <input
          type="text"
          className="border px-3 py-2 rounded w-full"
          placeholder="Buscar cotización por cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {isLoading && <p>Cargando...</p>}
      {isError && <p className="text-red-500">Error al cargar cotizaciones</p>}

      <div className="grid grid-cols-1">
        <table className="w-full border border-gray-300 col-span-1">
          <thead className="bg-gray-800 text-white text-sm">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Cliente</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Valor Total</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones?.map((cot) => (
              <tr key={cot.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{cot.id}</td>
                <td className="px-4 py-2 border">{cot.cliente?.nombre}</td>
                <td className="px-4 py-2 border capitalize">{cot.empresa}</td>
                <td className="px-4 py-2 border">
                  ${Number(cot.valor_total).toLocaleString()}
                </td>
                <td className="px-4 py-2 border text-center">
                  <Link
                    to={`/auth/crm/editar-cotizacion/${cot.id}`}
                    className="inline-block bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Editar
                  </Link>
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

