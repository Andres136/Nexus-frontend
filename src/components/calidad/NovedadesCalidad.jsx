
import { useNovedades } from "../../hooks/calidad/useNovedades";
import NexusLoader from "../NexusLoader";


import { Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
export default function Novedades() {
 



  const { novedades,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    eliminarNovedad,
  

 } = useNovedades();


  return (
    <div className="p-4 md:p-6">
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
  
  {/* TEXTO */}
  <div>
    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
      Gestión de calidad
    </h1>

    <p className="mt-1 text-sm text-gray-500">
      Visualiza indicadores, cumplimiento y estado de las novedades de calidad.
    </p>
  </div>

  {/* BOTÓN */}
  <Link  
    to="/auth/dashboard-semestral"
    className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
  >
    Dashboard Calidad
  </Link>

</div>


      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
  <input
  type="text"
  placeholder="Buscar..."
  value={filters.search || ''}
  onChange={(e) =>
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1 // 🔥 importante resetear paginación
    }))
  }
  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
/>
        </div>


      </div>

      {loading && <NexusLoader text="Cargando Novedades" />}
      {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {!loading && novedades.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No hay novedades registradas.
        </div>
      )}

      {novedades.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Fecha de revisión</th>
                <th className="px-4 py-3">Fecha de cierre</th>

                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Procesos</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Fuente</th>
                <th className="px-4 py-3">Soporte</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {novedades.map((novedad) => (
                <tr key={novedad.id} className="border-t border-gray-100 transition hover:bg-gray-50/80">
            <td className="px-4 py-3 text-xs font-medium text-gray-700">{novedad.id}</td>
            <td
  className="max-w-[280px]  px-4 py-3 text-xs font-medium text-gray-700 transition hover:text-blue-600"

>
  <p className="truncate" title={novedad.descripcion}>{novedad.descripcion}</p>
</td>

                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(novedad.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(novedad.fecha_revision).toLocaleDateString() || "Sin fecha de revisión"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(novedad.fecha_terminado).toLocaleDateString() || "Sin fecha de cierre"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${novedad.estado === "ABIERTA"
                          ? "bg-yellow-100 text-yellow-700"
                          : novedad.estado === "CERRADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {novedad.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {novedad.registro_diario?.departamento?.nombre}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {novedad.responsable?.name || "Sin responsable"}
                  </td>

     <td className="px-4 py-3">
  {novedad.fuentes ? (
    <span className="text-xs text-gray-600">{novedad.fuentes}</span>
  ) : (
    <span className="text-xs text-gray-400">Sin fuente</span>
  )}
</td>

     <td className="px-4 py-3">
  {novedad.soporte ? (
    <a
      href={`${import.meta.env.VITE_API_URL}/storage/${novedad.soporte}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 no-underline transition hover:bg-blue-100"
    >
      Ver soporte
    </a>
  ) : (
    <span className="text-xs text-gray-400">Sin archivo</span>
  )}
</td>
                <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    
    <Link
      to={`/auth/gestion-calidad/${novedad.id}`}
      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
    >
      <Edit2 size={16} />
    </Link>

    <button
      onClick={() => eliminarNovedad(novedad.id)}
      className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
    >
      <Trash2 size={16} />
    </button>

  </div>
</td>


                </tr>
              ))}
            </tbody>
          </table>
          </div>

    
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 md:px-6">

            <button
              disabled={pagination.current_page === 1}
              onClick={() =>
  setFilters(prev => ({
    ...prev,
    page: prev.page - 1
  }))
  }
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="text-sm font-medium text-gray-600">
              Página {pagination.current_page} de {pagination.last_page}
            </span>

            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() =>
  setFilters(prev => ({
    ...prev,  page: prev.page + 1
  }))
  }
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>

          </div>

        </div>
      )}



    </div>
  );
}