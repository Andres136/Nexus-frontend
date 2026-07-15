import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardX, ChevronRight, Plus, BarChart3, Settings2 } from "lucide-react";
import { useGetProductoNoConforme } from "../../hooks/calidad/useGetProductoNoConforme";
import { estadosApi } from "../../services/api";
import NexusLoader from "../NexusLoader";

const TIPOS_FALLA = [
  { value: "", label: "Todos los tipos de falla" },
  { value: "defecto_calidad", label: "Defecto de calidad" },
  { value: "incumplimiento_especificacion", label: "Incumplimiento de especificación" },
  { value: "dano_fisico", label: "Daño físico" },
  { value: "contaminacion", label: "Contaminación" },
  { value: "otro", label: "Otro" },
];

const TIPOS_ORIGEN = [
  { value: "", label: "Todos los orígenes" },
  { value: "cliente", label: "Cliente" },
  { value: "proveedor", label: "Proveedor" },
  { value: "interno", label: "Interno" },
];

const ORIGEN_BADGE = {
  cliente: "bg-blue-100 text-blue-700",
  proveedor: "bg-purple-100 text-purple-700",
  interno: "bg-gray-100 text-gray-700",
};

export default function ListaProductoNoConforme() {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
    estado_id: "",
    tipo_falla: "",
    origen: "",
    fecha_desde: "",
    fecha_hasta: "",
  });
  const [estados, setEstados] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    estadosApi.getAll().then((res) => setEstados(res.data || [])).catch(() => setEstados([]));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const { data: productos, pagination, isLoading, isFetching, error } = useGetProductoNoConforme(filters);

  const actualizarFiltro = (campo, valor) => {
    setFilters((prev) => ({ ...prev, [campo]: valor, page: 1 }));
  };

  const origenLabel = (nc) => {
    if (nc.origen === "proveedor") return nc.proveedor?.nombre || "Proveedor sin nombre";
    if (nc.origen === "cliente") return nc.cliente?.nombre || "Cliente sin nombre";
    return "Interno";
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <ClipboardX className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Productos No Conformes</h1>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>Calidad</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Producto No Conforme</span>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/auth/crm/no-conformidades/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            <BarChart3 className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/auth/crm/producto-no-conforme"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" /> Registrar
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por descripción o tipo de falla..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={filters.origen}
            onChange={(e) => actualizarFiltro("origen", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {TIPOS_ORIGEN.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.tipo_falla}
            onChange={(e) => actualizarFiltro("tipo_falla", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {TIPOS_FALLA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filters.estado_id}
            onChange={(e) => actualizarFiltro("estado_id", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.fecha_desde}
            onChange={(e) => actualizarFiltro("fecha_desde", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            title="Fecha desde"
          />
          <input
            type="date"
            value={filters.fecha_hasta}
            onChange={(e) => actualizarFiltro("fecha_hasta", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            title="Fecha hasta"
          />
        </div>
      </div>

      {isLoading && <NexusLoader text="Cargando productos no conformes" />}
      {error && (
        <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          No se pudieron cargar los productos no conformes.
        </p>
      )}

      {!isLoading && productos.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No hay productos no conformes registrados con estos filtros.
        </div>
      )}

      {productos.length > 0 && (
        <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${isFetching ? "opacity-60" : ""}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Origen</th>
                  <th className="px-4 py-3">Cliente / Proveedor</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Tipo de falla</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Fecha reporte</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Reportado por</th>
                  <th className="px-4 py-3">Análisis</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((nc) => (
                  <tr key={nc.id} className="border-t border-gray-100 transition hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">#{nc.id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ORIGEN_BADGE[nc.origen] || "bg-gray-100 text-gray-700"}`}>
                        {nc.origen}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{origenLabel(nc)}</td>
                    <td className="px-4 py-3 text-gray-600">{nc.producto?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{nc.tipo_falla || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{nc.cantidad_afectada}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {nc.fecha_reporte ? new Date(nc.fecha_reporte).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                        {nc.estado?.nombre || "Sin estado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{nc.comercial?.name || "—"}</td>
                    <td className="px-4 py-3">
                      {nc.analisis ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Sí</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/auth/crm/no-conformidades/${nc.id}/gestionar`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        <Settings2 size={14} /> Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 md:px-6">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm font-medium text-gray-600">
              Página {pagination.currentPage} de {pagination.lastPage} · {pagination.total} registros
            </span>
            <button
              disabled={pagination.currentPage === pagination.lastPage}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
