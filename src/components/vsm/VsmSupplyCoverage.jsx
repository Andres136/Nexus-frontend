import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PackageCheck,
  Search,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import useVSMSupplyCoverage from "../../hooks/vsm/useVSMSupplyCoverage";

const formatKg = (value = 0) =>
  `${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 2 })} kg`;

const STATUS = {
  FALTANTE_COMPRA: "bg-red-100 text-red-700",
  CUBIERTO_CON_PROVEEDOR: "bg-amber-100 text-amber-700",
  CUBIERTO_CON_STOCK: "bg-green-100 text-green-700",
};

export default function VsmSupplyCoverage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const { data, loading } = useVSMSupplyCoverage({
    search,
    estado,
    page,
    per_page: perPage,
  });
  const resumen = data.resumen ?? {};
  const paginacion = data.paginacion ?? {};

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Warehouse className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cobertura de necesidades</h2>
            <p className="text-sm text-gray-500">
              Necesidad pendiente del cliente contra inventario y compras abiertas de proveedor
            </p>
          </div>
        </div>
      </div>

      {loading && data.productos.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Calculando cobertura...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-6 bg-gray-50">
            <Metric label="Productos" value={resumen.productos_analizados ?? 0} icon={PackageCheck} />
            <Metric label="Con faltante" value={resumen.productos_con_faltante ?? 0} icon={AlertTriangle} />
            <Metric label="Necesidad pendiente" value={formatKg(resumen.necesidad_pendiente_kg)} icon={ShoppingCart} />
            <Metric label="Stock utilizable" value={formatKg(resumen.stock_utilizable_kg)} icon={Warehouse} />
            <Metric label="Faltante por comprar" value={formatKg(resumen.faltante_compra_kg)} icon={AlertTriangle} />
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-between px-6 py-4 border-t border-b bg-white">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={estado}
                onChange={(event) => {
                  setEstado(event.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="FALTANTE_COMPRA">Con faltante</option>
                <option value="CUBIERTO_CON_PROVEEDOR">Cubierto con proveedor</option>
                <option value="CUBIERTO_CON_STOCK">Cubierto con stock</option>
              </select>

              <select
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
          </div>

          <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-white">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Producto</th>
                  <th className="px-5 py-3 text-right">Necesidad</th>
                  <th className="px-5 py-3 text-right">Stock físico</th>
                  <th className="px-5 py-3 text-right">Stock utilizable</th>
                  <th className="px-5 py-3 text-right">Proveedor pendiente</th>
                  <th className="px-5 py-3 text-right">Faltante compra</th>
                  <th className="px-5 py-3">Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.productos.map((item) => (
                  <tr key={item.producto_id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{item.producto}</div>
                      <div className="text-xs text-gray-500">
                        {item.codigo} · {item.ordenes_cliente.length} necesidad(es)
                      </div>
                    </td>
                    <NumberCell value={item.necesidad_pendiente_kg} />
                    <NumberCell value={item.stock_fisico_kg} />
                    <NumberCell value={item.stock_utilizable_kg} />
                    <NumberCell value={item.proveedor_pendiente_kg} />
                    <NumberCell value={item.faltante_compra_kg} danger={item.faltante_compra_kg > 0} />
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS[item.estado]}`}>
                        {item.cobertura_porcentaje}%
                      </span>
                    </td>
                  </tr>
                ))}
                {data.productos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                      No existen necesidades pendientes para analizar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={paginacion}
            loading={loading}
            onPageChange={setPage}
          />

          <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 text-xs text-amber-800">
            {data.advertencias?.[1]}
          </div>
        </>
      )}
    </section>
  );
}

function Pagination({ pagination, loading, onPageChange }) {
  const current = pagination.pagina_actual ?? 1;
  const last = pagination.ultima_pagina ?? 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t text-sm">
      <span className="text-gray-500">
        Mostrando {pagination.desde ?? 0} a {pagination.hasta ?? 0} de {pagination.total ?? 0} productos
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={loading || current <= 1}
          onClick={() => onPageChange(1)}
          className="border rounded-lg p-2 disabled:opacity-40"
          aria-label="Primera página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          disabled={loading || current <= 1}
          onClick={() => onPageChange(current - 1)}
          className="border rounded-lg p-2 disabled:opacity-40"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-28 text-center text-gray-700">
          Página {current} de {last}
        </span>
        <button
          disabled={loading || current >= last}
          onClick={() => onPageChange(current + 1)}
          className="border rounded-lg p-2 disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          disabled={loading || current >= last}
          onClick={() => onPageChange(last)}
          className="border rounded-lg p-2 disabled:opacity-40"
          aria-label="Última página"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <Icon className="w-4 h-4 text-blue-600 mb-2" />
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function NumberCell({ value, danger = false }) {
  return (
    <td className={`px-5 py-4 text-right font-medium ${danger ? "text-red-600" : "text-gray-700"}`}>
      {formatKg(value)}
    </td>
  );
}
