import { useState } from "react";
import { Search, Filter, AlertCircle } from "lucide-react";
import { useGetCosteos } from "../../hooks/contabilidad/useGetCosteos";
import { useExportCosteos } from "../../hooks/contabilidad/useExportCosteos";
import { useEmpresas } from "../../hooks/useEmpresas";
import Select from "react-select";

const FILTERS_EMPTY = {
    empresa_id: "",
    producto_id: "",
    search: "",
    fecha_inicio: "",
    fecha_fin: ""
};

const formatCOP = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function PageCosteos() {
    const [filters, setFilters] = useState(FILTERS_EMPTY);
    const [page, setPage] = useState(1);
    const { empresas, loading: empresasLoading } = useEmpresas();

    const {
        data: costeos,
        error,
        isLoading,
        resumen,
        pagination
    } = useGetCosteos({ ...filters, page });

    const {exportCosteos}=useExportCosteos(filters);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    const limpiarFiltros = () => {
        setFilters(FILTERS_EMPTY);
        setPage(1);
    };

    const hayFiltros =
        filters.empresa_id ||
        filters.producto_id ||
        filters.search ||
        filters.fecha_inicio ||
        filters.fecha_fin;

    return (
        <div className="p-6 max-w-[100rem] mx-auto">
            {/* HEADER */}
  

<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
            Costeo y Utilidad por Producto
        </h1>
        <p className="text-sm text-gray-500">
            Análisis de ingresos, costos y margen bruto sin IVA
        </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-80">
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
                type="text"
                name="search"
                placeholder="Buscar producto..."
                value={filters.search}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <button
            onClick={exportCosteos}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
            Exportar Excel
        </button>
    </div>
</div>

            {/* FILTROS */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                        Filtros
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        isClearable
                        isLoading={empresasLoading}
                        placeholder="Todas las empresas"
                        options={empresas.map((empresa) => ({
                            value: empresa.id,
                            label: empresa.nombre,
                        }))}
                        value={
                            empresas
                                .filter((empresa) => Number(empresa.id) === Number(filters.empresa_id))
                                .map((empresa) => ({
                                    value: empresa.id,
                                    label: empresa.nombre,
                                }))[0] || null
                        }
                        onChange={(option) => {
                            setFilters((prev) => ({
                                ...prev,
                                empresa_id: option?.value || "",
                            }));
                            setPage(1);
                        }}
                        className="text-sm"
                        classNamePrefix="costeos-empresa"
                    />

                    <input
                        type="date"
                        name="fecha_inicio"
                        value={filters.fecha_inicio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />

                    <input
                        type="date"
                        name="fecha_fin"
                        value={filters.fecha_fin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                </div>

                {hayFiltros && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={limpiarFiltros}
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center gap-3">
                    <AlertCircle
                        className="text-red-500 shrink-0"
                        size={20}
                    />
                    <p className="text-red-700 text-sm font-medium">
                        Error al cargar el análisis de costos.
                    </p>
                </div>
            )}
   

{resumen && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                Productos
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {resumen.total_productos || 0}
            </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                KG Vendidos
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(resumen.total_kg_vendidos)}
            </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                Ingreso Total sin IVA
            </p>
            <p className="text-xl font-bold text-green-600 mt-1">
                {formatCOP(resumen.total_ingreso)}
            </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                Costo Total sin IVA
            </p>
            <p className="text-xl font-bold text-red-600 mt-1">
                {formatCOP(resumen.total_costo)}
            </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                KG Comprados
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(resumen.total_kg_comprado)}
            </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                Costo Total Comprado sin IVA
            </p>
            <p className="text-xl font-bold text-orange-600 mt-1">
                {formatCOP(resumen.total_costo_comprado)}
            </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">
                Utilidad Global sin IVA
            </p>
            <p className="text-xl font-bold text-blue-600 mt-1">
                {formatCOP(resumen.total_utilidad)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
                Margen: {formatNumber(resumen.margen_global)}%
            </p>
        </div>
    </div>
)}

            {/* TABLA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Producto
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    KG Vendidos
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Ingreso sin IVA
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Costo Promedio/KG sin IVA
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Costo Total sin IVA
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    KG Comprados
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Costo Total Comprado sin IVA
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Utilidad sin IVA
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Margen %
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr
                                        key={i}
                                        className="animate-pulse border-b"
                                    >
                                        {[...Array(9)].map((__, j) => (
                                            <td
                                                key={j}
                                                className="px-4 py-3"
                                            >
                                                <div className="h-4 bg-gray-200 rounded" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : costeos.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="text-center py-12 text-gray-400 italic"
                                    >
                                        No se encontraron resultados.
                                    </td>
                                </tr>
                            ) : (
                                costeos.map((item) => (
                                    <tr
                                        key={item.product_id}
                                        className="border-b hover:bg-blue-50/20"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.description}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            {formatNumber(
                                                item.total_kg_vendidos
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-semibold">
                                            {formatCOP(item.ingreso)}
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            {formatCOP(
                                                item.costo_promedio
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            {formatCOP(item.costo)}
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            {formatNumber(item.kg_comprado)}
                                        </td>

                                        <td className="px-4 py-3 text-sm">
                                            {formatCOP(item.costo_comprado)}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-bold">
                                            <span
                                                className={
                                                    Number(item.utilidad) >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                {formatCOP(
                                                    item.utilidad
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm font-semibold">
                                            <span
                                                className={
                                                    Number(
                                                        item.margen_porcentaje
                                                    ) >= 0
                                                        ? "text-blue-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                {formatNumber(
                                                    item.margen_porcentaje
                                                )}
                                                %
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
   

{pagination.lastPage > 1 && (
    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 bg-gray-50">
        
        <p className="text-sm text-gray-500">
            Página{" "}
            <span className="font-semibold text-gray-800">
                {pagination.currentPage}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-800">
                {pagination.lastPage}
            </span>
        </p>

        <div className="flex items-center gap-2">
            <button
                onClick={() =>
                    setPage((prev) =>
                        Math.max(prev - 1, 1)
                    )
                }
                disabled={page <= 1}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
            >
                Anterior
            </button>

            <button
                onClick={() =>
                    setPage((prev) =>
                        Math.min(
                            prev + 1,
                            pagination.lastPage
                        )
                    )
                }
                disabled={
                    page >= pagination.lastPage
                }
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40"
            >
                Siguiente
            </button>
        </div>
    </div>
)}
                </div>
            </div>
        </div>
    );
}
