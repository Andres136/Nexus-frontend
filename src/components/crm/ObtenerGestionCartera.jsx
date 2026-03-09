import { useState } from "react"
import { useListaCartera } from "../../hooks/crm/useListaCartera"
import NexusLoader from "../NexusLoader"
import ModalAbonoCartera from "./ModalAbonoCartera"

export default function ObtenerGestionCartera() {

  const [filtros, setFiltros] = useState({
    cliente_id: "",
    user_comercial_id: "",
    estado: "",
    numero_factura: "",
    page: 1
  })

  const [carteraSeleccionada, setCarteraSeleccionada] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  const { registros, pagination, isLoading, error } = useListaCartera(filtros)

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

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gestión de Cartera</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {registros.length} registros
          </span>
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            name="numero_factura"
            placeholder="🔍 Buscar factura..."
            value={filtros.numero_factura}
            onChange={handleChange}
 className="border border-gray-200 px-3 py-2 rounded-lg text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"
          />
          <input
            type="text"
            name="cliente_id"
            placeholder="🔍 Buscar cliente..."
            value={filtros.cliente_id}
            onChange={handleChange}
     className="border border-gray-200 px-3 py-2 rounded-lg text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"
          />
          <select
            name="estado"
            value={filtros.estado}
            onChange={handleChange}
    className="border border-gray-200 px-3 py-2 rounded-lg text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             focus:border-blue-500 transition"
          >
            <option value="">📋 Todos los estados</option>
            <option value="pendiente">⏳ Pendiente</option>
            <option value="completado">✅ Pagado</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <th className="px-3 py-3 text-left font-semibold">ID</th>
                <th className="px-3 py-3 text-left font-semibold">Cliente</th>
                <th className="px-3 py-3 text-left font-semibold">Comercial</th>
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
                <th className="px-3 py-3 text-center font-semibold">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {registros.map((reg, index) => {
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
                        {reg.estado === "pendiente" ? (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full">
                            ⏳ Pendiente
                          </span>
                        ) : (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded-full">
                            ✓ Pagado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-gray-600 truncate max-w-[100px]" title={reg.comercial?.name}>
                      {reg.comercial?.name ?? "N/A"}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-gray-700">{reg.numero_factura}</td>

                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-100 rounded text-gray-700 font-medium">
                        {reg.dias_credito}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs ${vencida ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                        {new Date(reg.fecha_vencimiento).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short"
                        })}
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

                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => abrirModalAbono(reg)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm hover:shadow"
                      >
                        💵 Abonar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
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
      </div>

      {/* MODAL */}
      {openModal && (
        <ModalAbonoCartera
          cartera={carteraSeleccionada}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  )
}