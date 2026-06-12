import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useGetRegistroPagoFactura } from "../../hooks/contabilidad/useGetRegistroPagoFactura";
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
    
    X,
    Filter,
} from "lucide-react";


const contabilidadLinks = [
     { to: "/auth/crm/contabilidad",                    label: "Facturas Compras",  icon: FileText   },
   { to: "/auth/crm/crear-factura", label: "Crear Factura", icon: BookOpen   },
  { to: "/auth/crm/catalogo-contabilidad",           label: "Catálogo Contable", icon: Receipt    },
  { to: "/auth/crm/obtener-pagos-factura-compra",    label: "Obtener Pagos",     icon: FileText   },
  { to: "/auth/crm/costeo",                     label: "Costeo",    icon: CreditCard },
];

const ESTADO_COLORS = {
    1: "bg-yellow-50 text-yellow-700",
    101: "bg-green-50 text-green-700",
    102: "bg-purple-50 text-purple-700",
    103: "bg-red-50 text-red-700",
};

const formatCOP = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });

const FILTERS_EMPTY = {
    proveedor_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado_id: "",
    search: "",
    page: 1,
};



export default function PageObtenerPagos() {

    const [filters, setFilters] = useState(FILTERS_EMPTY);
    const [selectedFacturaId, setSelectedFacturaId] = useState(null);
const [selectedPago, setSelectedPago] = useState(null);

    const { pagos, error, isLoading, totalPages, currentPage, total } =
        useGetRegistroPagoFactura(filters);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    const limpiarFiltros = () => setFilters(FILTERS_EMPTY);

    const cambiarPagina = (newPage) =>
        setFilters((prev) => ({ ...prev, page: newPage }));

    const hayFiltrosActivos =
        filters.search ||
        filters.proveedor_id ||
        filters.fecha_inicio ||
        filters.fecha_fin ||
        filters.estado_id;


    return (
        <>
        <div className="p-6 max-w-7xl mx-auto">

            {/* ── Sub-navegación ─────────────────────────────────────────── */}
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

            {/* ── Encabezado ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Registro de Pagos
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {total > 0 && `${total} registros encontrados`}
                    </p>
                </div>

                {/* Buscador principal */}
                <div className="relative w-full sm:w-72">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar factura o proveedor..."
                        value={filters.search}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* ── Filtros adicionales ─────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Filtros
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Fecha inicio
                        </label>
                        <input
                            type="date"
                            name="fecha_inicio"
                            value={filters.fecha_inicio}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Fecha fin
                        </label>
                        <input
                            type="date"
                            name="fecha_fin"
                            value={filters.fecha_fin}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            ID Proveedor
                        </label>
                        <input
                            type="number"
                            name="proveedor_id"
                            placeholder="Ej: 2"
                            value={filters.proveedor_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado_id"
                            value={filters.estado_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Todos los estados</option>
                            <option value="1">Pendiente</option>
                            <option value="101">Pagada</option>
                            <option value="102">Pago parcial</option>
                            <option value="103">Anulada</option>
                        </select>
                    </div>
                </div>

                {hayFiltrosActivos && (
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X size={13} /> Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* ── Error ──────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-r-lg flex items-center gap-3">
                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                    <p className="text-red-700 text-sm font-medium">
                        Error al cargar los registros. Intenta de nuevo.
                    </p>
                </div>
            )}

            {/* ── Tabla ──────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Factura</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Emisión</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Pendiente</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pagos</th>
                          
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(9)].map((__, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 bg-gray-200 rounded w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : pagos.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : (
                                pagos.map((factura) => (
                                    <tr key={factura.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                            {factura.numero_factura}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {factura.proveedor?.nombre || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {factura.empresa?.nombre || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {factura.fecha_emision}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                            {formatCOP(factura.total)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold">
                                            <span className={Number(factura.saldo_pendiente) > 0 ? "text-red-600" : "text-green-600"}>
                                                {formatCOP(factura.saldo_pendiente)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${ESTADO_COLORS[factura.estado_id] || "bg-gray-50 text-gray-600"}`}>
                                                {factura.estado?.nombre || "Sin estado"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
        

{factura.pagos.map((pago) => (
    <div
        key={pago.id}
        className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-2 py-1"
    >
        <div>
            <span className="font-medium">
                {formatCOP(pago.monto)}
            </span>
            <span className="text-gray-400 ml-1">
                — {pago.fecha_pago}
            </span>
            <p className="text-gray-400">
    Registrado por: {pago.user?.name || "N/A"}
</p>
        </div>

        <button
                onClick={() => {
                    setSelectedFacturaId(factura.id);
                    setSelectedPago(pago);

                setTimeout(() => {
                    window.dispatchEvent(
                        new CustomEvent("editarPagoFactura", {
                            detail: pago,
                        })
                    );
                }, 150);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
            title="Editar pago"
        >
            <Pencil size={13} />
        </button>
    </div>
))}
                                        </td>
        
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Paginación ───────────────────────────────────────── */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500">
                            Página{" "}
                            <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
                            de{" "}
                            <span className="font-semibold text-gray-700">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => cambiarPagina(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <button
                                onClick={() => cambiarPagina(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>


{selectedFacturaId && (
    <ModalAbonos
        facturaId={selectedFacturaId}
        pagoEditar={selectedPago}
        onClose={() => {
            setSelectedFacturaId(null);
            setSelectedPago(null);
        }}
    />
)}
        </>
    );
}
