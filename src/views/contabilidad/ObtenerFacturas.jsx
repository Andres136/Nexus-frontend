import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetFacturasCompras } from "../../hooks/contabilidad/useGetFacturasCompras";
import {
  FileText,
  Receipt,
  CreditCard,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// ─── Sub-navegación estilo Siigo ────────────────────────────────────────────
const contabilidadLinks = [
  { to: "/auth/crm/contabilidad",  label: "Facturas Compras", icon: FileText  },
  { to: "/auth/crm/impuestos",     label: "Impuestos",        icon: Receipt   },
  { to: "/auth/crm/formas-pago",   label: "Formas de Pago",   icon: CreditCard },
  { to: "/auth/crm/puc",           label: "PUC",              icon: BookOpen  },
  {to: "/auth/crm/reportes",       label: "Reportes",         icon: Search    },
  {to:"/auth/crm/crear-factura",    label: "Crear Factura",    icon: FileText    },

];

export default function ObtenerFacturas() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { facturas, pagination, error, isLoading } = useGetFacturasCompras(page, searchTerm);
console.log("Facturas:", facturas);
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Sub-navegación ─────────────────────────────────────────────────── */}
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

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Facturas de Compras
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total > 0 && `${pagination.total} registros encontrados`}
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por proveedor o ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-700 text-sm font-medium">
            Error al cargar las facturas. Por favor, intenta de nuevo.
          </p>
        </div>
      )}

      {/* ── Tabla ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Número Factura</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Numero factura Proveedor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Emisión</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    No se encontraron facturas.
                  </td>
                </tr>
              ) : (
                facturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{factura.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{factura.numero_factura}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{factura.numero_factura_proveedor || "N/A"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {factura.proveedor?.nombre || "Sin proveedor"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{factura.fecha_emision}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{factura.fecha_vencimiento}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {Number(factura.total).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4">
                    <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
  {factura.estados?.nombre || "Sin estado"}
</span>
                    </td>
            <td className="px-6 py-4">
  <div className="flex items-center justify-end gap-2">
    <button
      onClick={() => navigate(`/auth/crm/editar-factura/${factura.id}`)}
      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
    >
      Editar
    </button>
    <button className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
      Eliminar
    </button>
  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginación ───────────────────────────────────────────────────── */}
        {!isLoading && pagination.lastPage > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
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
  );
}
