import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useOrdenesFaltantes } from "../../hooks/useOrdenesFaltantes";
import { useSedes } from "../../hooks/useSedes";
import { useFaltantesStats } from "../../hooks/useFaltantesStats";
import {
  Loader2,
  Package,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  Building,
  User,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function OrdenesFaltantes() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [filterEstado, setFilterEstado] = useState("");
  const [filterSede, setFilterSede] = useState("");
  const [filterBodega, setFilterBodega] = useState("");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [sortBy, setSortBy] = useState("faltantes_desc");
  const [page, setPage] = useState(1);

  const { sedes, bodegasAll } = useSedes();
  const bodegasFiltradas = filterSede
    ? bodegasAll.filter((b) => String(b.sede_id) === String(filterSede))
    : bodegasAll;

  const { ordenes, pagination, isLoading, error } =
    useOrdenesFaltantes(page, debouncedSearchTerm, filterEstado, filterSede || null, filterBodega || null);

  const { stats, isLoading: statsLoading } = useFaltantesStats(filterSede || null, filterBodega || null);

  const toggleOrder = (ordenId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(ordenId)) {
      newExpanded.delete(ordenId);
    } else {
      newExpanded.add(ordenId);
    }
    setExpandedOrders(newExpanded);
  };

  const filteredAndSortedOrders = [...ordenes].sort((a, b) => {
      switch (sortBy) {
        case "faltantes_desc":
          return Number(b.faltantes_kg ?? 0) - Number(a.faltantes_kg ?? 0);
        case "faltantes_asc":
          return Number(a.faltantes_kg ?? 0) - Number(b.faltantes_kg ?? 0);
        case "codigo":
          return a.codigo.localeCompare(b.codigo);
        case "cliente":
          return (a.cliente?.nombre || "").localeCompare(b.cliente?.nombre || "");
        default:
          return 0;
      }
    });

  const estadosUnicos = [...new Set(ordenes.map((o) => o.estado))].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto p-4 sm:p-6">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 p-2.5 rounded-xl shadow-lg shadow-red-500/20">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Órdenes con Faltantes</h1>
            <p className="text-xs text-gray-500">Gestión de stock pendiente</p>
          </div>
          <div className="ml-auto bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-red-600 font-medium">{pagination?.total ?? ordenes.length} órdenes</span>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            {
              label: "Órdenes con faltantes",
              value: statsLoading ? "—" : stats?.total_ordenes_faltantes ?? 0,
              color: "text-red-600",
              bg: "bg-red-50",
              border: "border-red-100",
            },
            {
              label: "Referencias en faltante",
              value: statsLoading ? "—" : stats?.total_referencias_faltantes ?? 0,
              color: "text-orange-600",
              bg: "bg-orange-50",
              border: "border-orange-100",
            },
            {
              label: "Cubiertos por proveedor",
              value: statsLoading ? "—" : stats?.cubiertos_proveedor ?? 0,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              label: "Sin cobertura",
              value: statsLoading ? "—" : stats?.sin_cobertura ?? 0,
              color: "text-rose-700",
              bg: "bg-rose-50",
              border: "border-rose-100",
            },
          ].map((kpi) => (
            <div key={kpi.label} className={`${kpi.bg} border ${kpi.border} rounded-xl px-4 py-3`}>
              <p className="text-[11px] text-gray-500 font-medium leading-tight">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar orden o cliente..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <select
              value={filterEstado}
              onChange={(e) => { setFilterEstado(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white"
            >
              <option value="">Todos los estados</option>
              {estadosUnicos.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            <select
              value={filterSede}
              onChange={(e) => { setFilterSede(e.target.value); setFilterBodega(""); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
            <select
              value={filterBodega}
              onChange={(e) => { setFilterBodega(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white"
            >
              <option value="">Todas las bodegas</option>
              {bodegasFiltradas.map((bodega) => (
                <option key={bodega.id} value={bodega.id}>{bodega.nombre}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white"
            >
              <option value="faltantes_desc">Mayor faltantes</option>
              <option value="faltantes_asc">Menor faltantes</option>
              <option value="codigo">Código</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
        </div>

        {/* LISTA */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-gray-500 text-sm">Error al cargar datos</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
            <p className="text-gray-500 text-sm">No hay órdenes con faltantes para los filtros aplicados</p>
          </div>
        ) : (
        <div className="space-y-2">
          {filteredAndSortedOrders.map((orden) => {
            const isExpanded = expandedOrders.has(orden.orden_id);

            return (
              <div
                key={orden.orden_id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div
                  className="px-4 py-3 flex items-center gap-4 cursor-pointer"
                  onClick={() => toggleOrder(orden.orden_id)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-50 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-red-500" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{orden.codigo}</h3>
                      {orden.ordenes_trabajo?.length > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          {orden.ordenes_trabajo.map((ot) => (
                            <span
                              key={ot.id}
                              className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium"
                            >
                              {ot.codigo}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{orden.cliente?.nombre}</span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{orden.sede?.nombre}</span>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">
                        📅 {orden.fecha_entrega}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">Faltantes</p>
                      <p className="text-lg font-bold text-red-600">{Number(orden.faltantes_kg ?? 0).toFixed(2)} kg</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-slate-50/50">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100/80">
                            <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Producto</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Req. kg</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock kg</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Proveedor kg</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Prod. kg</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Faltante kg</th>
                            <th className="text-center px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orden.faltantes.map((f, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="px-4 py-2.5">
                                <p className="font-medium text-gray-900 text-sm">{f.nombre}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{f.codigo}</p>
                              </td>
                              <td className="px-2 py-2.5 text-center text-gray-700 font-medium">
                                {Number(f.cantidad_requerida ?? 0).toFixed(2)}
                              </td>
                          <td className="px-2 py-2.5 text-center">
  <span className="text-emerald-600 font-medium">
    {Number(f.stock_disponible ?? 0).toFixed(2)}
  </span>

  {f.resumen_bodegas?.length > 0 && (
    <div className="flex flex-wrap justify-center gap-1 mt-1">
      {f.resumen_bodegas.map((b) => (
        <span
          key={b.bodega_id}
          className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded"
        >
          {b.bodega_nombre}: {Number(b.stock_total).toFixed(2)}
        </span>
      ))}
    </div>
  )}
</td>
                              <td className="px-2 py-2.5 text-center">
                                <span className="text-blue-600 font-medium">{f.solicitado_proveedor ?? 0}</span>
                                {f.ordenes_proveedor?.length > 0 && (
                                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                                    {f.ordenes_proveedor.map((op) => (
                                      <span
                                        key={op.id}
                                        className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                                      >
                                        {op.codigo}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <span className="text-violet-600 font-medium">{f.en_produccion ?? 0}</span>
                                {f.ordenes_servicio?.length > 0 && (
                                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                                    {f.ordenes_servicio.map((os) => (
                                      <span
                                        key={os.id}
                                        className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded"
                                      >
                                        {os.codigo}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <span className="text-red-600 font-bold">{Number(f.faltante ?? 0).toFixed(2)}</span>
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                {f.faltante_real > 0 ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                                    {Number(f.faltante_real ?? 0).toFixed(2)}
                                  </span>
                                ) : f.proveedor_cubre_necesidad ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                    Cubierto
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                    {Number(f.faltante ?? 0).toFixed(2)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {!isLoading && !error && ordenes.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <div className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg">
              <span className="font-medium">{pagination?.current_page}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span>{pagination?.last_page}</span>
            </div>
            <button
              disabled={page === pagination?.last_page}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
