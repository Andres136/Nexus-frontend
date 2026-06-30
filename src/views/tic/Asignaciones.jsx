import { useEffect, useState } from 'react';
import { Search, Plus, Package, Calendar, ChevronLeft, ChevronRight, Trash2, AlertCircle, X, Activity } from 'lucide-react';
import AsignarEquipo from '../../components/tic/AsignarEquipo'
import { useAsignacionesEquipo } from '../../hooks/tic/useAsignacionesEquipo'
import Select from 'react-select';  
import { Link } from 'react-router-dom';

export default function Asignaciones() {
  const {
    obtenerAsignaciones,
    asignaciones,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    desactivarAsignacion,
      sedesFiltro,
      usuariosFiltro,

  } = useAsignacionesEquipo();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
   const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    obtenerAsignaciones();
  }, []);
  console.log(asignaciones);

  const handleFiltrar = (campo, valor) => {
    setFilters({ ...filters, [campo]: valor });
  };

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
    setFilters({ ...filters, search: e.target.value });
  };

  const handlePaginacion = (pagina) => {
    setFilters({ ...filters, page: pagina });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className=" mx-auto">
        {/* Header Compacto */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
            <p className="text-xs text-gray-500 mt-0.5">Gestiona la asignación de equipos</p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth/tic/paradas-equipos tickets"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Activity className="w-4 h-4" />
              Paradas equipos
            </Link>
            <Link
              to="/auth/tic/mantenimientos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Programa Mantenimientos
            </Link>
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>

        {/* Filtros Compactos */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={handleBusqueda}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.activo || ''}
              onChange={(e) => handleFiltrar('activo', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>

            <select
  value={filters.sede_id}
  onChange={(e) => handleFiltrar('sede_id', e.target.value)}
  className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
>
  <option value="">Todas</option>
  {sedesFiltro?.map((s) => (
    <option key={s.id} value={s.id}>
      {s.nombre}
    </option>
  ))}
</select>

<Select
  options={usuariosFiltro?.map((u) => ({ value: u.id, label: u.name })) || []}
  onChange={(option) => handleFiltrar('usuario_id', option ? option.value : '')}
  placeholder="Filtrar por usuario"
  className="text-sm"
/>
 
     
          </div>
        </div>

        {/* Tabla Profesional */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Package className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="ml-3 text-sm text-gray-600">Cargando...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : asignaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <Package className="w-10 h-10 mb-2" />
              <p className="text-sm">Sin asignaciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Empresa</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuario</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Producto</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Recibe</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Sede</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Asignación</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Devolución</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Acta Asignación</th>
<th className="px-4 py-3 text-center font-semibold text-gray-700">Acta Devolución</th>
<th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
<th className="px-4 py-3 text-center font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {asignaciones.map((asignacion) => (
                    <tr key={asignacion.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900 font-medium">{asignacion.id}</td>
                      <td className="px-4 py-3 text-gray-600">{asignacion.empresa?.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{asignacion.usuario?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{asignacion.producto?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{asignacion.usuario_recibe?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{asignacion.sede?.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(asignacion.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-600">{asignacion.fecha_devolucion ? new Date(asignacion.fecha_devolucion).toLocaleDateString() : "-"}</td>
                                            {/* COLUMNAS PDF */}
<td className="px-4 py-3 text-center">
  {asignacion.acta_asignacion_url ? (
    <a
      href={asignacion.acta_asignacion_url.startsWith('http')
        ? asignacion.acta_asignacion_url
        : `${API_URL}${asignacion.acta_asignacion_url}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
    >
      📄 Ver PDF
    </a>
  ) : (
    <span className="text-gray-400">-</span>
  )}
</td>

<td className="px-4 py-3 text-center">
  {asignacion.acta_devolucion_url ? (
    <a
      href={asignacion.acta_devolucion_url.startsWith('http')
        ? asignacion.acta_devolucion_url
        : `${API_URL}${asignacion.acta_devolucion_url}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
    >
      📄 Ver PDF
    </a>
  ) : (
    <span className="text-gray-400">-</span>
  )}
</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${asignacion.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {asignacion.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => desactivarAsignacion(asignacion.id)}
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Desactivar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación Compacta */}
        {pagination && pagination.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {pagination.from}-{pagination.to} de {pagination.total}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handlePaginacion(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .slice(Math.max(0, pagination.current_page - 2), Math.min(pagination.last_page, pagination.current_page + 1))
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePaginacion(page)}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                      page === pagination.current_page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                onClick={() => handlePaginacion(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Mejorado */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Asignar Equipo</h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <AsignarEquipo onClose={() => setMostrarModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
