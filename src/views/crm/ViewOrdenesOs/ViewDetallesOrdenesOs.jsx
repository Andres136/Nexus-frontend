
import Select from "react-select"

import { 
  FiArrowLeft, FiSave, FiCalendar, FiUser, FiFileText, 
  FiPackage, FiAlertCircle, FiCheckCircle, FiLoader
} from "react-icons/fi"
import NexusLoader from "../../../components/NexusLoader"

import { useOrdenServicioDetalle } from "../../../hooks/crm/useDetalleServicioDetalle"
import { useNavigate } from "react-router-dom"

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    fontSize: '13px',
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
    '&:hover': { borderColor: '#3b82f6' }
  }),
  menu: (base) => ({ ...base, zIndex: 9999, fontSize: '13px' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 })
}

const estadoConfig = {
  pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', icon: FiLoader },
  completada: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: FiCheckCircle },
  en_proceso: { bg: 'bg-blue-50', text: 'text-blue-700', icon: FiLoader }
}

export default function ViewDetallesOrdenesOs() {
  const navigate = useNavigate()
  const {
orden,
    loading,
    detallesEditados,
    observacionesOrden,
    setObservacionesOrden,
    pdfUrl,
    errores,
    guardando,
    handleChange,
    handleGuardar,
    setDetallesEditados,
    proveedoresAll,
    procesos
  }=useOrdenServicioDetalle()

  if (loading) {
    return (
    <NexusLoader text="Cargando ordenes..." />
    )
  }

  if (!orden) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <FiAlertCircle size={40} className="text-gray-400" />
        <p className="text-gray-500">No se encontró la orden de servicio.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver
        </button>
      </div>
    )
  }

  const proveedorActual = detallesEditados.proveedor_id || orden.proveedor_id
  const estado = estadoConfig[orden.estado] || estadoConfig.pendiente
  const EstadoIcon = estado.icon

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4">
      {/* Header */}
          {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Lado izquierdo - Navegación y título */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Volver"
            >
              <FiArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
              <FiFileText className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Orden de Servicio <span className="text-blue-600">#{orden.numero_os}</span>
              </h1>
              <p className="text-sm text-gray-500">{orden.detalles?.length || 0} items en esta orden</p>
            </div>
          </div>

          {/* Lado derecho - Acciones */}
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <FiFileText size={16} />
                Ver PDF
              </a>
            )}
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {guardando ? <FiLoader className="animate-spin" size={16} /> : <FiSave size={16} />}
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Proveedor */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
              <FiUser size={12} />
              Proveedor
            </label>
            <Select
              styles={selectStyles}
              options={proveedoresAll.map(p => ({ value: p.id, label: p.nombre }))}
              value={
                proveedoresAll
                  .map(p => ({ value: p.id, label: p.nombre }))
                  .find(option => option.value === proveedorActual) || null
              }
              onChange={(selected) =>
                setDetallesEditados(prev => ({
                  ...prev,
                  proveedor_id: selected?.value
                }))
              }
              placeholder="Seleccionar proveedor"
              menuPortalTarget={document.body}
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
              <FiCalendar size={12} />
              Fecha
            </label>
            <div className="h-9 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {orden.fecha}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
              Estado
            </label>
            <div className={`h-9 flex items-center gap-2 px-3 rounded-md text-sm font-medium ${estado.bg} ${estado.text}`}>
              <EstadoIcon size={14} />
              {orden.estado?.replace('_', ' ')}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
              Observaciones
            </label>
           <textarea
  value={observacionesOrden}
  onChange={(e) => setObservacionesOrden(e.target.value)}
  placeholder="Agregar observaciones de la orden"
  className="w-full min-h-[36px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
/>
          </div>
        </div>
      </div>

      {/* Tabla Detalles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <FiPackage className="text-gray-400" size={16} />
            <span className="text-sm font-semibold text-gray-700">Detalles de la Orden</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Producto</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Solicitado</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase w-28">Cantidad</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-44">Proceso</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orden.detalles?.map((detalle) => {
                const obs = detalle.orden_compra_detalle.observaciones?.[0]
                return (
                  <tr key={detalle.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-mono text-gray-500">#{detalle.id}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-medium text-gray-800">
                        {detalle.orden_compra_detalle.producto?.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {detalle.orden_compra_detalle.descripcion}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                        {detalle.orden_compra_detalle.cantidad_solicitada}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        step="1"
                        value={detallesEditados[obs?.id]?.cantidad || detalle.cantidad}
                        onChange={(e) => handleChange(obs?.id, "cantidad", e.target.value)}
                        className="w-full h-9 px-2 text-sm text-center border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                      {errores[`detalles.${detalle.id}.cantidad`] && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FiAlertCircle size={10} />
                          {errores[`detalles.${detalle.id}.cantidad`][0]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Select
                        styles={selectStyles}
                        options={procesos.map(p => ({ value: p.id, label: p.nombre }))}
                        value={
                          procesos.find(p => p.id === (detallesEditados[obs?.id]?.proceso_bolsas_id || obs?.proceso_bolsas_id))
                            ? {
                                value: detallesEditados[obs?.id]?.proceso_bolsas_id || obs?.proceso_bolsas_id,
                                label: procesos.find(p => p.id === (detallesEditados[obs?.id]?.proceso_bolsas_id || obs?.proceso_bolsas_id))?.nombre
                              }
                            : null
                        }
                        onChange={(selectedOption) => handleChange(obs?.id, "proceso_bolsas_id", selectedOption?.value)}
                        menuPortalTarget={document.body}
                        placeholder="Seleccionar..."
                      />
                      {errores[`detalles.${detalle.id}.proceso_bolsas_id`] && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FiAlertCircle size={10} />
                          {errores[`detalles.${detalle.id}.proceso_bolsas_id`][0]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={detallesEditados[obs?.id]?.observacion || obs?.observacion || ""}
                        onChange={(e) => handleChange(obs?.id, "observacion", e.target.value)}
                        placeholder="Sin observaciones"
                        className="w-full h-9 px-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                      {errores[`detalles.${detalle.id}.observacion`] && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FiAlertCircle size={10} />
                          {errores[`detalles.${detalle.id}.observacion`][0]}
                        </p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}