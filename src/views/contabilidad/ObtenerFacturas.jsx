import { useState } from "react";
import PropTypes from "prop-types";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetFacturasCompras } from "../../hooks/contabilidad/useGetFacturasCompras";
import { useGetFormasPago } from "../../hooks/contabilidad/useGetFormasPago";
import { useRegisterAbonoFacturaCompra } from "../../hooks/contabilidad/useRegisterAbonoFacturaCompra";
import { useGetRegistroPagoFacturanteById } from "../../hooks/contabilidad/useGetRegistroPagoFacturaById";
import {
  FileText,
  Receipt,
  CreditCard,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Pencil,
  Banknote,
  Trash2,
} from "lucide-react";

const contabilidadLinks = [
  { to: "/auth/crm/contabilidad",           label: "Facturas Compras",  icon: FileText  },
  { to: "/auth/crm/catalogo-contabilidad",  label: "Catálogo Contable", icon: Receipt   },
  { to: "/auth/crm/obtener-pagos-factura-compra",          label: "Obtener Pagos",     icon: FileText  },
  { to: "/auth/crm/formas-pago",            label: "Formas de Pago",    icon: CreditCard},
  { to: "/auth/crm/puc",                    label: "PUC",               icon: BookOpen  },
  { to: "/auth/crm/reportes",               label: "Reportes",          icon: Search    },
];

// ─── Modal de abonos (componente separado para resetear hooks al abrir) ────────
function ModalAbonos({ facturaId, onClose }) {
  const { formasPago } = useGetFormasPago();
  const { formData, error, isLoading, handleChange, handleSubmit } =
    useRegisterAbonoFacturaCompra(facturaId);
  const { data: abonos, isLoading: loadingAbonos } =
    useGetRegistroPagoFacturanteById(facturaId);

  const abonosList = Array.isArray(abonos) ? abonos : abonos ? [abonos] : [];

  const inputBase =
    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
  const inputNormal = `${inputBase} border-gray-300`;
  const inputError  = `${inputBase} border-red-400 bg-red-50`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">
            Registrar Abono — Factura <span className="text-blue-600">#{facturaId}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* ── Formulario ── */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Error general */}
            {error?.general && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-red-700 text-xs font-medium">
                  {error.general.map((msg, i) => (
                    <p key={i}>{msg}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Forma de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Forma de pago <span className="text-red-500">*</span>
              </label>
              <select
                name="forma_pago_id"
                value={formData.forma_pago_id}
                onChange={handleChange}
                className={error?.forma_pago_id ? inputError : inputNormal}
              >
                <option value="">Selecciona una forma de pago</option>
                {formasPago?.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
              {error?.forma_pago_id && (
                <p className="text-xs text-red-500 mt-1">{error.forma_pago_id[0]}</p>
              )}
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={error?.monto ? inputError : inputNormal}
              />
              {error?.monto && (
                <p className="text-xs text-red-500 mt-1">{error.monto[0]}</p>
              )}
            </div>

            {/* Fecha de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de pago <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                className={error?.fecha_pago ? inputError : inputNormal}
              />
              {error?.fecha_pago && (
                <p className="text-xs text-red-500 mt-1">{error.fecha_pago[0]}</p>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={2}
                placeholder="Opcional..."
                className={`${error?.observaciones ? inputError : inputNormal} resize-none`}
              />
              {error?.observaciones && (
                <p className="text-xs text-red-500 mt-1">{error.observaciones[0]}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-[2] px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${
                  isLoading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Guardando...
                  </span>
                ) : "Registrar Abono"}
              </button>
            </div>
          </form>

      
        </div>
      </div>
    </div>
  );
}

ModalAbonos.propTypes = {
  facturaId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ─── Vista principal ───────────────────────────────────────────────────────────
export default function ObtenerFacturas() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacturaId, setSelectedFacturaId] = useState(null);

  const { facturas, pagination, error, isLoading } = useGetFacturasCompras(page, searchTerm);

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">

        {/* ── Sub-navegación ───────────────────────────────────────────────── */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-1 overflow-x-auto pb-px">
            {contabilidadLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── Encabezado ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Facturas de Compras
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total > 0 && `${pagination.total} registros encontrados`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por proveedor o ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* ── Error carga ──────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">
              Error al cargar las facturas. Por favor, intenta de nuevo.
            </p>
          </div>
        )}

        {/* ── Tabla ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Número Factura</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">N° Factura Proveedor</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Emisión</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Pendiente</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(9)].map((__, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-4 bg-gray-200 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : facturas.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                      No se encontraron facturas.
                    </td>
                  </tr>
                ) : (
                  facturas.map((factura) => (
                    <tr key={factura.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-500 font-mono">#{factura.id}</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">{factura.numero_factura}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{factura.numero_factura_proveedor || "N/A"}</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">{factura.proveedor?.nombre || "Sin proveedor"}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{factura.fecha_emision}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{factura.fecha_vencimiento}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-800">
                        {Number(factura.total).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold">
                        <span className={Number(factura.saldo_pendiente) > 0 ? "text-red-600" : "text-green-600"}>
                          {Number(factura.saldo_pendiente).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                          {factura.estados?.nombre || "Sin estado"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/auth/crm/editar-factura/${factura.id}`)}
                            title="Editar"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setSelectedFacturaId(factura.id)}
                            title="Ver abonos"
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Banknote size={15} />
                          </button>
                          <button
                            title="Eliminar"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Paginación ───────────────────────────────────────────────── */}
          {!isLoading && pagination.lastPage > 1 && (
            <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Página <span className="font-semibold text-gray-700">{pagination.currentPage}</span> de{" "}
                <span className="font-semibold text-gray-700">{pagination.lastPage}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.lastPage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Abonos ─────────────────────────────────────────────────────── */}
      {selectedFacturaId && (
        <ModalAbonos
          facturaId={selectedFacturaId}
          onClose={() => setSelectedFacturaId(null)}
        />
      )}
    </>
  );
}
