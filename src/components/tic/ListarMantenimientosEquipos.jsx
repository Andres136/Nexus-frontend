import  { useEffect, useState } from "react";
import { useMantenimientoEquiposTic } from "../../hooks/tic/useMantenimientoEquiposTic";
import { ChevronLeft, ChevronRight, Edit2, Search } from "lucide-react";
import ModalEjecutarMantenimiento from "./ModalEjecutarMantenimiento";
export default function ListarMantenimientosEquipos() {
  const {
    filters,
    setFilters,
    listarMantenimientos,
    pagination,
    loading,
    error,
    ListarMantenimientosEquiposTable,

  } = useMantenimientoEquiposTic();
const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState(null);
const [mostrarModal, setMostrarModal] = useState(false);
  useEffect(() => {
    ListarMantenimientosEquiposTable(filters);
  }, [filters]);

  // Estadísticas
  const estadisticas = listarMantenimientos.reduce(
    (acc, item) => {
      if (item.estado === "completado") acc.completados++;
      if (item.estado === "pendiente") acc.pendientes++;
      if (item.estado === "en_proceso") acc.en_proceso++;
      acc.costo_total += parseFloat(item.costo) || 0;
      return acc;
    },
    { completados: 0, pendientes: 0, en_proceso: 0, costo_total: 0 }
  );

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePerPage = (e) => {
    setFilters({ ...filters, per_page: parseInt(e.target.value), page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setFilters({ ...filters, page: newPage });
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      completado: "bg-green-100 text-green-800",
      pendiente: "bg-yellow-100 text-yellow-800",
      en_proceso: "bg-blue-100 text-blue-800",
    };
    return badges[estado] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mantenimiento de Equipos TIC</h1>
        <p className="text-sm text-gray-600 mt-1">Gestiona y registra el mantenimiento de equipos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Completados</p>
          <p className="text-2xl font-bold text-green-700 mt-2">{estadisticas.completados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-700 mt-2">{estadisticas.pendientes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">En Proceso</p>
          <p className="text-2xl font-bold text-blue-700 mt-2">{estadisticas.en_proceso}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por sede, producto..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-700 mb-2">Registros</label>
            <select
              value={filters.per_page}
              onChange={handlePerPage}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Sede</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Producto</th>

                <th className="px-6 py-3 text-left font-semibold text-gray-700">Tipo</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">F. Programada</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Usuario</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">F. Ejecución</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Soporte</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700 ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : listarMantenimientos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No hay registros disponibles
                  </td>
                </tr>
              ) : (
                listarMantenimientos.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-900">{item.sede?.nombre || "-"}</td>
              <td className="px-6 py-3">
  <div className="flex flex-col leading-tight">
    <span className="font-medium text-gray-900">
      {item.producto?.name || "-"}
    </span>

    <span className="text-xs text-gray-500">
      Asignado a:{" "}
      <span className="font-medium text-gray-700">
        {item.asignacion?.usuario_recibe?.name || "Sin asignar"}
      </span>
    </span>
  </div>
</td>
                    <td className="px-6 py-3 text-gray-700">{item.tipo || "-"}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {new Date(item.fecha_programada).toLocaleDateString("es-ES")}
                    </td>
                     <td className="px-6 py-3 text-gray-700">{item.usuario?.name || "-"}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {item.fecha_ejecucion ? new Date(item.fecha_ejecucion).toLocaleDateString("es-ES") : "-"}
                    </td>
                   
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(item.estado)}`}>
                        {item.estado.replace("_", " ")}
                      </span>
                    </td>
<td className="px-6 py-3">
  {item.archivos?.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {item.archivos.map((archivo, index) => (
        <a
          key={archivo.id}
          href={archivo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md hover:bg-blue-100 transition"
        >
          📎 {index + 1}
        </a>
      ))}
    </div>
  ) : (
    <span className="text-gray-400 text-xs">Sin soporte</span>
  )}
</td>

                    <td className="px-6 py-3 text-right">
                      <button
                      onClick={() => {
  setMantenimientoSeleccionado(item);
  setMostrarModal(true);
}}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                      <Edit2 className="w-4 h-4 inline-block" /> Ejecutar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {mostrarModal && (
  <ModalEjecutarMantenimiento
    mantenimiento={mantenimientoSeleccionado}
    onClose={() => setMostrarModal(false)}
    onSuccess={() => {
      setMostrarModal(false);
      ListarMantenimientosEquiposTable(filters);
    }}
  />
)}
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-600">
            Página <span className="font-medium">{pagination.current_page}</span> de{" "}
            <span className="font-medium">{pagination.last_page}</span> | Total:{" "}
            <span className="font-medium">{pagination.total}</span> registros
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1 || loading}
              className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page || loading}
              className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};