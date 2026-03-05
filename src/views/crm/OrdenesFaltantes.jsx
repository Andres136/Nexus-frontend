import { useMemo, useState } from "react";
import { useOrdenesFaltantes } from "../../hooks/useOrdenesFaltantes";
import {
  Loader2,
  Package,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Building,
  User,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function OrdenesFaltantes() {
  const { ordenes, isLoading, error } = useOrdenesFaltantes();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [sortBy, setSortBy] = useState("faltantes_desc");

  const toggleOrder = (ordenId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(ordenId)) next.delete(ordenId);
      else next.add(ordenId);
      return next;
    });
  };

  const filteredAndSortedOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return ordenes
      .filter((orden) => {
        const matchesSearch =
          orden.codigo.toLowerCase().includes(term) ||
          orden.cliente?.nombre?.toLowerCase().includes(term);

        const matchesFilter =
          filterEstado === "all" || orden.estado === filterEstado;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "faltantes_desc":
            return b.faltantes_total - a.faltantes_total;
          case "faltantes_asc":
            return a.faltantes_total - b.faltantes_total;
          case "codigo":
            return a.codigo.localeCompare(b.codigo);
          case "cliente":
            return (a.cliente?.nombre || "").localeCompare(
              b.cliente?.nombre || ""
            );
          default:
            return 0;
        }
      });
  }, [ordenes, searchTerm, filterEstado, sortBy]);

  const estadosUnicos = useMemo(
    () => [...new Set(ordenes.map((o) => o.estado))],
    [ordenes]
  );

  const totalFaltantes = useMemo(
    () => ordenes.reduce((sum, o) => sum + o.faltantes_total, 0),
    [ordenes]
  );

  const totalProductosAfectados = useMemo(
    () => ordenes.reduce((sum, o) => sum + o.faltantes.length, 0),
    [ordenes]
  );

  const totalClientesAfectados = useMemo(
    () => new Set(ordenes.map((o) => o.cliente?.id)).size,
    [ordenes]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando órdenes con faltantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <div className="text-center">
            <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Error al cargar datos
            </h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (ordenes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Excelente!</h3>
          <p className="text-gray-600">
            No hay órdenes pendientes con faltantes de stock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2.5 rounded-full">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Órdenes con Faltantes</h1>
              <p className="text-gray-600 text-sm">
                Gestiona las órdenes que requieren atención por falta de stock
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Package className="w-7 h-7 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Total Órdenes</p>
                  <p className="text-xl font-bold text-gray-800">{ordenes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-7 h-7 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Total Faltantes</p>
                  <p className="text-xl font-bold text-red-600">{totalFaltantes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-600">Productos Afectados</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {totalProductosAfectados}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <User className="w-7 h-7 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Clientes Afectados</p>
                  <p className="text-xl font-bold text-purple-600">
                    {totalClientesAfectados}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por código de orden o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="lg:w-48">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="all">Todos los estados</option>
                {estadosUnicos.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="faltantes_desc">Más faltantes primero</option>
                <option value="faltantes_asc">Menos faltantes primero</option>
                <option value="codigo">Por código</option>
                <option value="cliente">Por cliente</option>
              </select>
            </div>
          </div>

          {filteredAndSortedOrders.length !== ordenes.length && (
            <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                Mostrando {filteredAndSortedOrders.length} de {ordenes.length} órdenes
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
          {filteredAndSortedOrders.map((orden) => {
            const isExpanded = expandedOrders.has(orden.orden_id);

            return (
              <div
                key={orden.orden_id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition"
              >
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex flex-wrap items-center gap-2">
                          <span>{orden.codigo}</span>
                          {orden.ordenes_trabajo?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {orden.ordenes_trabajo.map((ot) => (
                                <span
                                  key={ot.id}
                                  className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-semibold"
                                >
                                  {ot.codigo} — {ot.estado}
                                </span>
                              ))}
                            </div>
                          )}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              orden.estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : orden.estado === "En proceso"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {orden.estado}
                          </span>

                          <div className="flex items-center gap-1 text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="text-sm">
                              {orden.cliente?.nombre || "Sin cliente"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-600">
                            <Building className="w-4 h-4" />
                            <span className="text-sm">
                              {orden.sede?.nombre || "Sin sede"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Faltantes detectados</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-red-600">
                            {orden.faltantes_total}
                          </span>
                          <span className="text-xs text-gray-500">productos</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleOrder(orden.orden_id)}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        {isExpanded ? (
                          <>
                            Ocultar <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Ver detalles <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Productos con faltantes ({orden.faltantes.length})
                    </h4>

                    <div className="overflow-auto max-h-[360px] rounded-lg border border-gray-200">
                      <table className="w-full bg-white text-sm">
                        <thead className="bg-gray-800 text-white sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Producto</th>
                            <th className="px-3 py-2 text-center font-semibold">Requerido (Kg)</th>
                            <th className="px-3 py-2 text-center font-semibold">Stock Disponible</th>
                            <th className="px-3 py-2 text-center font-semibold">Faltante</th>
                            <th className="px-3 py-2 text-left font-semibold">Bodegas con Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orden.faltantes.map((faltante, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-3 py-2">
                                <p className="font-medium text-gray-800">{faltante.nombre}</p>
                                <p className="text-xs text-gray-500">{faltante.codigo}</p>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {faltante.cantidad_requerida.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`font-medium ${
                                    faltante.stock_disponible > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {faltante.stock_disponible.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                  {faltante.faltante.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <div className="space-y-1">
                                  {faltante.resumen_bodegas?.length > 0 ? (
                                    faltante.resumen_bodegas.map((bodega) => (
                                      <div
                                        key={bodega.bodega_id}
                                        className="flex items-center gap-2 text-xs"
                                      >
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span className="font-medium">
                                          {bodega.bodega_nombre}:
                                        </span>
                                        <span className="text-green-600 font-semibold">
                                          {bodega.stock_total} unidades
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-red-500 text-xs font-medium">
                                      Sin stock disponible
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Ver orden completa
                      </button>
                      <button className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-sm">
                        <Package className="w-4 h-4" />
                        Gestionar stock
                      </button>
                      <button className="flex items-center gap-2 bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 transition text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Notificar cliente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredAndSortedOrders.length === 0 && searchTerm && (
          <div className="text-center py-10">
            <Search className="w-14 h-14 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600 mb-1">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500 text-sm">
              Intenta con otros términos de búsqueda o ajusta los filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}