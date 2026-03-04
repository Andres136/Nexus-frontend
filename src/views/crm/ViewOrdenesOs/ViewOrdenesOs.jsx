import { useState } from "react"
import NexusLoader from "../../../components/NexusLoader"
import { useOrdenesServicio } from "../../../hooks/crm/useOrdenesSevicio"
import Select from "react-select"
import {
  FiEdit2, FiTrash2, FiEye, FiFilter, FiCalendar,
  FiChevronLeft, FiChevronRight, FiFileText, FiRefreshCw,
  FiSearch, FiX
} from "react-icons/fi"
import { useOrdenesOsBydi } from "../../../hooks/crm/useOrdenesOsBydi"
import { Link, useNavigate } from "react-router-dom"



export default function ViewOrdenesOs() {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const navigate = useNavigate()  

  const [filtros, setFiltros] = useState({
    search: "",
    proveedor_id: null,
    estado: null,
    fecha_inicio: null,
    fecha_fin: null,
    page: 1,
  })
  const { ordenes,
    loading,
    refetch,
    pagination,
    selectStyles,
    estadoConfig } = useOrdenesServicio(filtros)

    const {

      refetch: refetchOrden
    }=useOrdenesOsBydi(ordenSeleccionada)

  const proveedores = [
    ...new Map(ordenes.map((o) => [o.proveedor.id, o.proveedor])).values(),
  ]

  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.per_page || 1))
  const hasActiveFilters = filtros.estado || filtros.proveedor_id || filtros.fecha_inicio || filtros.fecha_fin

  const clearFilters = () => {
    setFiltros({
      search: "",
      proveedor_id: null,
      estado: null,
      fecha_inicio: null,
      fecha_fin: null,
      page: 1,
    })
  }

  if (loading) {
    return <NexusLoader text="Cargando Ordenes de Servicio" />
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FiFileText className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Órdenes de Servicio</h1>
              <p className="text-sm text-gray-500">{pagination?.total || 0} registros encontrados</p>
            </div>
          </div>
     <div className="flex items-center gap-2">
           <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw size={14} />
            Actualizar
          </button>
          <Link to='/auth/crm/ordenes-servicio-proveedor/create'>
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFileText size={14} />
          Crea Nueva OS
            </button>
          </Link>
     </div>

        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" size={16} />
              <span className="text-sm font-semibold text-gray-700">Filtros</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <FiX size={12} />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              styles={selectStyles}
              options={[
                { value: "pendiente", label: "🟡 Pendiente" },
                { value: "completada", label: "🟢 Completada" },
                { value: "en_proceso", label: "🔵 En Proceso" },
              ]}
              value={filtros.estado ? { value: filtros.estado, label: filtros.estado } : null}
              onChange={(option) => setFiltros({ ...filtros, estado: option?.value || null, page: 1 })}
              placeholder="Todos los estados"
              isClearable
            />
            <Select
              styles={selectStyles}
              options={proveedores.map((p) => ({ value: p.id, label: p.nombre }))}
              onChange={(option) => setFiltros({ ...filtros, proveedor_id: option?.value || null, page: 1 })}
              placeholder="Todos los proveedores"
              isClearable
            />
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="date"
                value={filtros.fecha_inicio || ''}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_inicio: e.target.value, page: 1 }))}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="date"
                value={filtros.fecha_fin || ''}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_fin: e.target.value, page: 1 }))}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        {ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiSearch size={48} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">No se encontraron órdenes</p>
            <p className="text-xs">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° OS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ordenes.map((orden) => {
                  const estado = estadoConfig[orden.estado] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' }
                  return (
                    <tr key={orden.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-500">#{orden.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-800">{orden.proveedor?.nombre}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 font-mono">{orden.numero_os}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{orden.fecha}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${estado.bg} ${estado.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`}></span>
                          {orden.estado?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/auth/crm/ordenes-servicio-proveedor/${setOrdenSeleccionada(orden.id) || orden.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                          <FiEdit2 size={15} />
                          </button>
                          {/* <button
                          <button
                            onClick={() => console.log("Editar", orden.id)}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => console.log("Eliminar", orden.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 size={15} />
                          </button>*/}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {pagination?.total > pagination?.per_page && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> a <span className="font-semibold text-gray-700">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> de <span className="font-semibold text-gray-700">{pagination.total}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFiltros({ ...filtros, page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={i}
                    onClick={() => setFiltros({ ...filtros, page: pageNum })}
                    className={`w-8 h-8 text-xs font-medium rounded-md transition-all ${pagination.current_page === pageNum
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'hover:bg-gray-200 text-gray-600'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
              <button
                onClick={() => setFiltros({ ...filtros, page: pagination.current_page + 1 })}
                disabled={pagination.current_page === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}