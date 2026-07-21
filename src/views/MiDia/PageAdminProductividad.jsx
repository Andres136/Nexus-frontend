import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gauge, ChevronRight, Download, ListTodo, PlusCircle, Coffee, CircleCheck } from "lucide-react";
import { useEquipoProductividad, useExportarProductividad } from "../../hooks/useMiDiaAdmin";
import NexusLoader from "../../components/NexusLoader";
import AccesoDenegado from "../../components/AccesoDenegado";

const ESTADO_BADGE = {
  DISPONIBLE: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  EN_ACTIVIDAD: { label: "En actividad", color: "bg-indigo-100 text-indigo-700" },
  PAUSA: { label: "En pausa", color: "bg-amber-100 text-amber-700" },
  FINALIZADA: { label: "Jornada finalizada", color: "bg-gray-100 text-gray-600" },
  SIN_CLASIFICAR: { label: "Sin clasificar", color: "bg-gray-100 text-gray-500" },
};

const ESTADOS_FILTRO = [
  { value: "", label: "Todos los estados" },
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "EN_ACTIVIDAD", label: "En actividad" },
  { value: "PAUSA", label: "En pausa" },
  { value: "SIN_CLASIFICAR", label: "Sin clasificar" },
];

const TIPO_ICONO = {
  TAREA: ListTodo,
  OTRA_ACTIVIDAD: PlusCircle,
  DISPONIBLE: Coffee,
  AUTOMATICA: CircleCheck,
};

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function minsToHM(mins) {
  const m = Math.round(Number(mins) || 0);
  if (m <= 0) return "0m";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h}h ${r > 0 ? r + "m" : ""}`.trim() : `${r}m`;
}

export default function PageAdminProductividad() {
  const [filters, setFilters] = useState({ page: 1, per_page: 15, fecha: hoyISO(), estado: "", search: "" });
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const delay = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput]);

  const { equipo, pagination, isLoading, isFetching, error } = useEquipoProductividad(filters);
  const { exportando, handleExportar } = useExportarProductividad();

  const actualizarFiltro = (campo, valor) => {
    setFilters((prev) => ({ ...prev, [campo]: valor, page: 1 }));
  };

  if (error?.response?.status === 403) {
    return <AccesoDenegado mensaje="El panel de productividad del equipo es solo para el administrador del sistema." />;
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Gauge className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Productividad del equipo</h1>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>Productividad</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Panel administrativo</span>
            </nav>
          </div>
        </div>
        <button
          onClick={() => handleExportar(filters)}
          disabled={exportando}
          className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" /> {exportando ? "Exportando..." : "Exportar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={filters.fecha}
            onChange={(e) => actualizarFiltro("fecha", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={filters.estado}
            onChange={(e) => actualizarFiltro("estado", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {ESTADOS_FILTRO.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {isLoading && <NexusLoader text="Cargando productividad del equipo" />}
      {error && error.response?.status !== 403 && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          No se pudo cargar la productividad del equipo.
        </p>
      )}

      {!isLoading && equipo.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
          No hay jornadas registradas con estos filtros.
        </div>
      )}

      {equipo.length > 0 && (
        <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${isFetching ? "opacity-60" : ""}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Actividad actual</th>
                  <th className="px-4 py-3">Tareas</th>
                  <th className="px-4 py-3">Sin clasificar</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipo.map((fila) => {
                  const badge = ESTADO_BADGE[fila.estado] ?? ESTADO_BADGE.SIN_CLASIFICAR;
                  const Icon = TIPO_ICONO[fila.actividad_actual?.tipo] ?? ListTodo;
                  return (
                    <tr key={fila.usuario?.id} className="border-t border-gray-100 transition hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{fila.usuario?.name}</p>
                        <p className="text-xs text-gray-400">{fila.usuario?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fila.actividad_actual ? (
                          <span className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            {fila.actividad_actual.titulo || fila.actividad_actual.categoria?.nombre || fila.actividad_actual.tipo}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="text-xs">
                          {fila.tareas.pendientes} pend · {fila.tareas.completadas} listas · {fila.tareas.bloqueadas} bloq
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fila.resumen ? minsToHM(fila.resumen.minutos_sin_clasificar) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/auth/admin/productividad/usuarios/${fila.usuario?.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
