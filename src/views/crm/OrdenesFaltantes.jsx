import { useState } from "react";
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
  CheckCircle
} from "lucide-react";

export default function OrdenesFaltantes() {

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [sortBy, setSortBy] = useState("faltantes_desc");
  const [page, setPage] = useState(1);

  const { ordenes, pagination, isLoading, error } =
    useOrdenesFaltantes(page, searchTerm);

  const toggleOrder = (ordenId) => {

    const newExpanded = new Set(expandedOrders);

    if (newExpanded.has(ordenId)) {
      newExpanded.delete(ordenId);
    } else {
      newExpanded.add(ordenId);
    }

    setExpandedOrders(newExpanded);

  };

  const filteredAndSortedOrders = ordenes

    .filter((orden) => {

      return filterEstado === "all" || orden.estado === filterEstado;

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
          return (a.cliente?.nombre || "").localeCompare(b.cliente?.nombre || "");

        default:
          return 0;

      }

    });

  const estadosUnicos = [...new Set(ordenes.map((o) => o.estado))];

  if (isLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );

  }

  if (error) {

    return (
      <div className="text-center py-20">
        Error al cargar datos
      </div>
    );

  }

  if (ordenes.length === 0) {

    return (
      <div className="text-center py-20">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
        No hay órdenes con faltantes
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gray-50 py-6 px-4">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center gap-3 mb-6">

          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <div>

            <h1 className="text-3xl font-bold">
              Órdenes con faltantes
            </h1>

            <p className="text-gray-500">
              Gestión de faltantes de stock
            </p>

          </div>

        </div>

        {/* FILTROS */}

        <div className="bg-white p-5 rounded-xl shadow-sm border mb-6">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="flex-1 relative">

              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar orden o cliente"
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />

            </div>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="border px-4 py-3 rounded-lg"
            >

              <option value="all">Todos</option>

              {estadosUnicos.map((estado) => (
                <option key={estado}>{estado}</option>
              ))}

            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border px-4 py-3 rounded-lg"
            >

              <option value="faltantes_desc">
                Más faltantes
              </option>

              <option value="faltantes_asc">
                Menos faltantes
              </option>

              <option value="codigo">
                Código
              </option>

              <option value="cliente">
                Cliente
              </option>

            </select>

          </div>

        </div>

        {/* LISTA */}

        <div className="space-y-4">

          {filteredAndSortedOrders.map((orden) => {

            const isExpanded = expandedOrders.has(orden.orden_id);

            return (

              <div
                key={orden.orden_id}
                className="bg-white rounded-xl border shadow-sm"
              >

                <div className="p-6 flex justify-between items-center">

                  <div>

                    <h3 className="text-xl font-bold flex items-center gap-3">

                      <Package className="text-red-500" />

                      {orden.codigo}

                    </h3>

                    <div className="flex gap-4 mt-1 text-sm text-gray-600">

                      <span className="flex items-center gap-1">

                        <User size={16} />

                        {orden.cliente?.nombre}

                      </span>

                      <span className="flex items-center gap-1">

                        <Building size={16} />

                        {orden.sede?.nombre}

                      </span>

                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    <div className="text-right">

                      <p className="text-sm text-gray-500">
                        Faltantes
                      </p>

                      <p className="text-2xl font-bold text-red-600">

                        {orden.faltantes_total}

                      </p>

                    </div>

                    <button
                      onClick={() => toggleOrder(orden.orden_id)}
                      className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg"
                    >

                      <Eye size={18} />

                      {isExpanded ? (
                        <>
                          Ocultar
                          <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Ver
                          <ChevronDown size={16} />
                        </>
                      )}

                    </button>

                  </div>

                </div>

                {isExpanded && (

                  <div className="border-t p-6 bg-gray-50">

                    <table className="w-full">

                      <thead>

                        <tr className="text-left text-sm text-gray-500">

                          <th>Producto</th>
                          <th>Requerido</th>
                          <th>Stock</th>
                          <th>Faltante</th>

                        </tr>

                      </thead>

                      <tbody>

                        {orden.faltantes.map((f, i) => (

                          <tr key={i} className="border-t">

                            <td className="py-3">

                              {f.nombre}

                              <div className="text-xs text-gray-400">
                                {f.codigo}
                              </div>

                            </td>

                            <td>
                              {f.cantidad_requerida.toFixed(2)}
                            </td>

                            <td className="text-green-600">
                              {f.stock_disponible.toFixed(2)}
                            </td>

                            <td className="text-red-600 font-bold">
                              {f.faltante.toFixed(2)}
                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            );

          })}

        </div>

        {/* PAGINACIÓN */}

        <div className="flex justify-center gap-3 mt-10">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Anterior
          </button>

          <span className="px-4 py-2">

            Página {pagination?.current_page} de {pagination?.last_page}

          </span>

          <button
            disabled={page === pagination?.last_page}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Siguiente
          </button>

        </div>

      </div>

    </div>

  );

}