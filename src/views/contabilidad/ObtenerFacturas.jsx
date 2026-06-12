import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetFacturasCompras } from "../../hooks/contabilidad/useGetFacturasCompras";
import ModalAbonos from "../../components/contabilidad/ModalAbonos";
import {
  FileText,
  Receipt,
  CreditCard,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Pencil,
  Banknote,
  Trash2,
  ShieldAlert,
  Ban,
} from "lucide-react";
import { useRegisterFacturaCompras } from "../../hooks/contabilidad/useRegisterFacturaCompras";
import { useAuth } from "../../hooks/useAuth";

const ADMINISTRADOR_ROLE_ID = 1;

const contabilidadLinks = [
 
  { to: "/auth/crm/contabilidad",                    label: "Facturas Compras",  icon: FileText   },
   { to: "/auth/crm/crear-factura", label: "Crear Factura", icon: BookOpen   },
  { to: "/auth/crm/catalogo-contabilidad",           label: "Catálogo Contable", icon: Receipt    },
  { to: "/auth/crm/obtener-pagos-factura-compra",    label: "Obtener Pagos",     icon: FileText   },
  { to: "/auth/crm/costeo",                     label: "Costeo",    icon: CreditCard },

];

// placeholder — eliminado el componente local, ahora viene de ModalAbonos importado
// ─── Vista principal ───────────────────────────────────────────────────────────
export default function ObtenerFacturas() {
  const navigate = useNavigate();
  const { user } = useAuth({ middleware: "auth" });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacturaId, setSelectedFacturaId] = useState(null);

  const { facturas, pagination, error, isLoading,resumen } = useGetFacturasCompras(page, searchTerm);
  const { anularFactura, eliminarFacturaDefinitivamente } = useRegisterFacturaCompras();
  const esAdministrador = user?.role_id === ADMINISTRADOR_ROLE_ID;

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1">
         

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


{resumen && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
    
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Facturas
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {resumen.total_facturas || 0}
      </p>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Subtotal
      </p>
      <p className="text-xl font-bold text-gray-900 mt-1">
        {Number(resumen.total_subtotal || 0).toLocaleString(
          "es-CO",
          {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }
        )}
      </p>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Total General
      </p>
      <p className="text-xl font-bold text-green-600 mt-1">
        {Number(resumen.total_general || 0).toLocaleString(
          "es-CO",
          {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }
        )}
      </p>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Saldo Pendiente
      </p>
      <p className="text-xl font-bold text-red-600 mt-1">
        {Number(
          resumen.total_saldo_pendiente || 0
        ).toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        })}
      </p>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase font-semibold">
        Total Pagado
      </p>
      <p className="text-xl font-bold text-blue-600 mt-1">
        {Number(resumen.total_pagado || 0).toLocaleString(
          "es-CO",
          {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          }
        )}
      </p>
    </div>
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
                            onClick={() => anularFactura(factura.id)}
                            title="Anular factura"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Ban size={15} />
                          </button>
                          {esAdministrador && (
                            <button
                              onClick={() => eliminarFacturaDefinitivamente(factura.id)}
                              title="Eliminar factura definitivamente"
                              className="p-1.5 text-red-800 hover:text-white hover:bg-red-800 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
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
        </div> </div>
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
