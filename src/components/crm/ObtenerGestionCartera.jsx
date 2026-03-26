import { useState } from "react"
import { useListaCartera } from "../../hooks/crm/useListaCartera"
import NexusLoader from "../NexusLoader"
import ModalAbonoCartera from "./ModalAbonoCartera"
import { useDebounce } from "../../hooks/useDebounce"
import { useGestionCartera } from "../../hooks/crm/useGestionCartera"
import { useAuth } from "../../hooks/useAuth"
import { Link } from "react-router-dom"
import { CheckCircle, DollarSign, Pencil } from "lucide-react"
import { formatDate } from "../../helpers"

export default function ObtenerGestionCartera() {
const { user } = useAuth({middleware: 'auth'})

  const [filtros, setFiltros] = useState({
    buscar: "",
    fecha_inicio: "",
    fecha_fin: "",
    cliente_id: "",
    user_comercial_id: "",
    estado: "",
    page: 1,
    per_page: 10
  })

  const [carteraSeleccionada, setCarteraSeleccionada] = useState(null)
  const [openModal, setOpenModal] = useState(false)
const{cancelarDeuda}=useGestionCartera()
  const { registros, pagination, isLoading, error, total_cartera, total_vencido} = useListaCartera(useDebounce(filtros, 500))
   console.log(registros);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <NexusLoader text="Cargando Cartera" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error cargando la cartera</p>
      </div>
    )
  }

  const formatMoney = (value) => {
    return Number(value).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP"
    })
  }

  const hoy = new Date()

  const handleChange = (e) => {
    const { name, value } = e.target

    setFiltros(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }))
  }

  const cambiarPagina = (page) => {
    setFiltros(prev => ({
      ...prev,
      page
    }))
  }

  const abrirModalAbono = (cartera) => {
    setCarteraSeleccionada(cartera)
    setOpenModal(true)
  }

  const limpiarFiltros = () => {
    setFiltros({
      buscar: "", 
      fecha_inicio: "",
      fecha_fin: "",
      cliente_id: "",
      user_comercial_id: "",
      estado: "",
      page: 1,
      per_page: 10
    })
  }
  const puedeGestionar = ![7, 9].includes(user?.role_id)

 const hayFiltrosActivos =
  filtros.buscar ||
  filtros.estado ||
  filtros.fecha_inicio ||
  filtros.fecha_fin


  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
   <div className="grid grid-cols-1">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">


<div className="p-5 border-b border-gray-100">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">Gestión de Cartera</h2>
        <p className="text-sm text-gray-500">Administra los pagos pendientes de tus clientes</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Link
        to="/auth/crm/registrar-cartera" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
       Registra una Factura
      </Link>
      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
        {pagination?.total ?? registros.length} registros
      </span>
    </div>
  </div>
</div>

        {/* FILTROS */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda de cliente */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Cliente</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="buscar"
                  placeholder="Buscar por cliente..."
                  value={filtros.buscar}
                  onChange={handleChange}
                  className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                    transition placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Estado</label>
              <select
                name="estado"
                value={filtros.estado}
                onChange={handleChange}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  transition bg-white"
              >
                <option value="">Todos</option>
                <option value="pendiente">⏳ Pendiente</option>
                <option value="completado">✅ Pagado</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Desde</label>
              <input
                type="date"
                name="fecha_inicio"
                value={filtros.fecha_inicio}
                onChange={handleChange}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  transition"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Hasta</label>
              <input
                type="date"
                name="fecha_fin"
                value={filtros.fecha_fin}
                onChange={handleChange}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                  transition"
              />
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {hayFiltrosActivos && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <th className="px-3 py-3 text-left font-semibold">ID</th>
                <th className="px-3 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-3 py-3 text-left font-semibold">Empresa</th>
                <th className="px-3 py-3 text-left font-semibold">Comercial</th>
                <th className="px-3 py-3 text-left font-semibold">Fecha Factura</th>
                <th className="px-3 py-3 text-left font-semibold">Factura</th>
                <th className="px-3 py-3 text-center font-semibold">Días</th>
                <th className="px-3 py-3 text-center font-semibold">Vencimiento</th>
                <th className="px-3 py-3 text-right font-semibold">Saldo</th>
                <th className="px-3 py-3 text-right font-semibold">Base</th>
                <th className="px-3 py-3 text-right font-semibold">IVA</th>
                <th className="px-3 py-3 text-right font-semibold">RteFte</th>
                <th className="px-3 py-3 text-right font-semibold">RteICA</th>
                <th className="px-3 py-3 text-right font-semibold">Total</th>
                <th className="px-3 py-3 text-left font-semibold">Obs.</th>
             {puedeGestionar && (
  <th className="px-3 py-3 text-center font-semibold">Acción</th>
)}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">No hay registros</p>
                      <p className="text-xs">Ajusta los filtros para ver resultados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                registros.map((reg, index) => {
                  const vencida =
                    new Date(reg.fecha_vencimiento) < hoy &&
                    reg.estado === "pendiente"

                  return (
                    <tr 
                      key={reg.id} 
                      className={`
                        transition-all hover:bg-gray-50
                        ${vencida ? "bg-red-50 hover:bg-red-100" : ""}
                        ${index % 2 === 0 && !vencida ? "bg-white" : !vencida ? "bg-gray-50/50" : ""}
                      `}
                    >
                      <td className="px-3 py-2.5 text-gray-500 font-mono">{reg.id}</td>

                <td className="px-3 py-2.5">
  <div className="flex flex-col gap-1">
    <span className="font-medium text-gray-800 truncate max-w-[120px]" title={reg.cliente?.nombre}>
      {reg.cliente?.nombre ?? "N/A"}
    </span>
    
    {/* Estado */}
    {reg.estado === "pendiente" ? (
      <span className="inline-flex items-center w-fit px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full">
        ⏳ Pendiente
      </span>
    ) : (
      <span className="inline-flex items-center w-fit px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded-full">
        ✓ Pagado
      </span>
    )}

    {/* Pagos realizados */}
    {reg.pagos?.length > 0 && (
      <div className="mt-1 space-y-1">
        <span className="text-[10px] font-semibold text-gray-500 uppercase">
          Pagos ({reg.pagos.length})
        </span>
        {reg.pagos.map((pago) => (
          <div 
            key={pago.id} 
            className="flex items-center gap-2 text-[10px] bg-green-50 px-2 py-1 rounded border border-green-100"
          >
          
            <span className="text-gray-600">
              {formatDate(pago.fecha_pago)}
            </span>
            <span className="font-semibold text-green-700">
              {formatMoney(pago.valor_pago)}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
</td>
                       <td className="px-3 py-2.5 text-gray-600 truncate max-w-[100px]" title={reg.empresa?.nombre}>
                        {reg.empresa?.nombre ?? "N/A"}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 truncate max-w-[100px]" title={reg.comercial?.name}>
                        {reg.comercial?.name ?? "N/A"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-gray-700">{formatDate(reg.fecha_factura)}</td>

                      <td className="px-3 py-2.5 font-mono text-gray-700">{reg.numero_factura}</td>

                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-100 rounded text-gray-700 font-medium">
                          {reg.dias_credito}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-xs ${vencida ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                          {formatDate(reg.fecha_vencimiento)}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right">
                        <span className="font-bold text-blue-600">{formatMoney(reg.saldo_pendiente)}</span>
                      </td>

                      <td className="px-3 py-2.5 text-right text-gray-600">{formatMoney(reg.base)}</td>

                      <td className="px-3 py-2.5 text-right text-gray-500">{formatMoney(reg.iva)}</td>

                      <td className="px-3 py-2.5 text-right text-gray-500">{formatMoney(reg.rete_renta)}</td>

                      <td className="px-3 py-2.5 text-right text-gray-500">{formatMoney(reg.rete_ica)}</td>

                      <td className="px-3 py-2.5 text-right">
                        <span className="font-bold text-gray-800">{formatMoney(reg.valor_total)}</span>
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="text-gray-500 truncate block max-w-[80px]" title={reg.observaciones}>
                          {reg.observaciones ?? "—"}
                        </span>
                      </td>

{puedeGestionar && (
  <td className="px-3 py-2.5">
    <div className="flex items-center justify-center gap-2">

      {reg.estado === "pendiente" && (
        <>
          {/* Abonar */}
          <button
            onClick={() => abrirModalAbono(reg)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-medium transition-all"
            title="Registrar abono parcial"
          >
            <DollarSign size={14} />
            <span className="hidden sm:inline">Abonar</span>
          </button>

          {/* Pagar total */}
          <button
            onClick={() => cancelarDeuda(reg.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-all"
            title="Pagar deuda completa"
          >
            <CheckCircle size={14} />
            <span className="hidden sm:inline">Pagar</span>
          </button>
        </>
      )}

      {/* Editar */}
      <Link to={`/auth/crm/editar-cartera/${reg.id}`}>
        <button
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-all"
          title="Editar registro"
        >
          <Pencil size={14} />
          <span className="hidden sm:inline">Editar</span>
        </button>
      </Link>

    </div>
  </td>
)}                 </tr>
                  )
                })
              )}
            </tbody>
          </table>
<div className="">    
  
   <div className="text-lg font-bold text-blue-600">
 Total cartera: {formatMoney(total_cartera)}
</div>
 
 <div>
  <span className="text-sm text-gray-500">
    Total Vencido :{" "}
    <span className="font-semibold text-red-600">
      {formatMoney(
        total_vencido
      )}
    </span>
  </span>
 </div>
 </div>
              
        </div>

        {/* PAGINACIÓN */}
        {registros.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-600">
              Página <span className="font-semibold">{pagination.current_page}</span> de <span className="font-semibold">{pagination.last_page}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarPagina(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Anterior
              </button>
              <button
                onClick={() => cambiarPagina(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <ModalAbonoCartera
          cartera={carteraSeleccionada}
          onClose={() => setOpenModal(false)}
        />
      )}
      </div>
    </div>
  )
}