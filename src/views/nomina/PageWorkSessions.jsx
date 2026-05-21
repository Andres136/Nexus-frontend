import { useState, useMemo } from "react";
import { Search, Loader2, Clock, Calendar } from "lucide-react";
import { useGetWorkSessions } from "../../hooks/nomina/useGetWorkSessions";

function minsToHM(mins) {
  if (!mins && mins !== 0) return "—";
  const m = Number(mins);
  if (m === 0) return "0m";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h}h ${r > 0 ? r + "m" : ""}`.trim() : `${r}m`;
}

function fmtHora(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtFecha(d) {
  if (!d) return "—";
  // d may arrive as full ISO datetime ("2026-05-20T00:00:00.000000Z") or bare date ("2026-05-20")
  return new Date(d.slice(0, 10) + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const COLORS = [
  "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700", "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700", "bg-teal-100 text-teal-700",
];
function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function Pagination({ meta, page, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  const total = meta.last_page;
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push("...");
    pages.push(total);
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Mostrando {meta.from ?? 0} a {meta.to ?? 0} de {meta.total} registros
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs">‹</button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">…</span>
          ) : (
            <button key={p} onClick={() => onPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                p === page ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>{p}</button>
          )
        )}
        <button onClick={() => onPage(page + 1)} disabled={page === total}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs">›</button>
      </div>
    </div>
  );
}

export default function PageWorkSessions() {
  const today = new Date().toISOString().slice(0, 10);
  const firstDay = today.slice(0, 8) + "01";

  const [search, setSearch]         = useState("");
  const [fechaInicio, setFechaInicio] = useState(firstDay);
  const [fechaFin, setFechaFin]     = useState(today);
  const [page, setPage]             = useState(1);

  const params = useMemo(() => ({
    search:       search || undefined,
    fecha_inicio: fechaInicio || undefined,
    fecha_fin:    fechaFin    || undefined,
    page,
    per_page: 15,
  }), [search, fechaInicio, fechaFin, page]);

  const { workSessions, isLoading } = useGetWorkSessions(params);
  const lista = workSessions?.data?.data ?? [];
  const meta  = workSessions?.data ?? null;

  const handleSearch     = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFechaInicio = (e) => { setFechaInicio(e.target.value); setPage(1); };
  const handleFechaFin   = (e) => { setFechaFin(e.target.value); setPage(1); };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Registro de Asistencia</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sesiones de trabajo registradas por el kiosko.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar empleado..."
            className="pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
          />
        </div>

        {/* Fecha inicio */}
        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 h-9 bg-white">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="date"
            value={fechaInicio}
            onChange={handleFechaInicio}
            className="text-sm text-gray-700 bg-transparent border-none outline-none"
          />
        </div>

        <span className="text-gray-400 text-sm">→</span>

        {/* Fecha fin */}
        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 h-9 bg-white">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <input
            type="date"
            value={fechaFin}
            onChange={handleFechaFin}
            className="text-sm text-gray-700 bg-transparent border-none outline-none"
          />
        </div>

        {meta?.total != null && (
          <span className="text-xs text-gray-400 ml-1">{meta.total} registros</span>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-sm text-gray-400">
            <Loader2 className="h-5 w-5 mr-2 animate-spin text-indigo-500" /> Cargando...
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            No hay sesiones de trabajo para los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Empleado", "Fecha", "Entrada", "Salida",
                    "Pausa", "Almuerzo", "Trabajado", "Pausa",
                    "Tardanza", "Sábado", "Festivo", "Kiosko",
                  ].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {lista.map((item) => {
                  const nombre = item.empleado?.name ?? "—";
                  return (
                    <tr key={item.uuid} className="hover:bg-gray-50 transition-colors">
                      {/* Empleado */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(nombre)}`}>
                            {getInitials(nombre)}
                          </div>
                          <span className="font-medium text-gray-800 whitespace-nowrap">{nombre}</span>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {fmtFecha(item.registro_diario)}
                      </td>

                      {/* Entrada */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <Clock className="h-3 w-3" />
                          {fmtHora(item.hora_entrada)}
                        </div>
                      </td>

                      {/* Salida */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-red-500 font-medium">
                          <Clock className="h-3 w-3" />
                          {fmtHora(item.hora_salida)}
                        </div>
                      </td>

                      {/* Pausa salida / entrada */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {item.hora_salida_brake
                          ? `${fmtHora(item.hora_salida_brake)} – ${fmtHora(item.hora_ingreso_brake)}`
                          : "—"}
                      </td>

                      {/* Almuerzo */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {item.hora_salida_almuerzo
                          ? `${fmtHora(item.hora_salida_almuerzo)} – ${fmtHora(item.hora_ingreso_almuerzo)}`
                          : "—"}
                      </td>

                      {/* Min trabajados */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-indigo-700">
                          {minsToHM(item.minutos_trabajados)}
                        </span>
                      </td>

                      {/* Min pausa */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {minsToHM(item.minutos_pausa)}
                      </td>

                      {/* Tardanza */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.minutos_tardanza > 0 ? (
                          <span className="text-orange-600 font-medium">{minsToHM(item.minutos_tardanza)}</span>
                        ) : (
                          <span className="text-green-600 text-xs">A tiempo</span>
                        )}
                      </td>

                      {/* Sábado */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {item.sabado_minutos > 0 ? minsToHM(item.sabado_minutos) : "—"}
                      </td>

                      {/* Festivo */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.festivo_minutos > 0 ? (
                          <span className="text-purple-600 font-medium">{minsToHM(item.festivo_minutos)}</span>
                        ) : "—"}
                      </td>

                      {/* Kiosko */}
                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {item.kiosko?.name ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} page={page} onPage={setPage} />
      </div>
    </div>
  );
}
