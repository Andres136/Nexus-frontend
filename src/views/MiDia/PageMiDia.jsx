import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import CreatableSelect from "react-select/creatable";
import {
  Sun,
  ChevronRight,
  Clock,
  Timer,
  CircleAlert,
  CircleCheck,
  CheckCircle2,
  Coffee,
  ListTodo,
  PlusCircle,
  Ban,
  AlertTriangle,
  Loader2,
  Play,
} from "lucide-react";
import { useMiDia } from "../../hooks/useMiDia";
import { miDiaService } from "../../services/miDiaService";
import NexusLoader from "../../components/NexusLoader";
import { showToast } from "../../helpers/utils/showToast";

function fmtHora(dt) {
  if (!dt) return "—";
  const date = new Date(dt);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function minsToHM(mins) {
  const m = Math.round(Number(mins) || 0);
  if (m <= 0) return "0m";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h}h ${r > 0 ? r + "m" : ""}`.trim() : `${r}m`;
}

// Mismos tokens de color que ya usa el resto de la app (ver Indicador en PageWorkSessions.jsx)
const ESTADO_BADGE = {
  DISPONIBLE: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  EN_ACTIVIDAD: { label: "En actividad", color: "bg-indigo-100 text-indigo-700" },
  PAUSA: { label: "En pausa", color: "bg-amber-100 text-amber-700" },
  FINALIZADA: { label: "Jornada finalizada", color: "bg-gray-100 text-gray-600" },
};

const ESTADO_ACTIVIDAD_BADGE = {
  ACTIVA: "bg-indigo-100 text-indigo-700",
  PAUSADA: "bg-amber-100 text-amber-700",
  COMPLETADA: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-gray-100 text-gray-500",
  BLOQUEADA: "bg-red-100 text-red-700",
  INTERRUMPIDA: "bg-orange-100 text-orange-700",
};

const TIPO_ICONO = {
  TAREA: ListTodo,
  OTRA_ACTIVIDAD: PlusCircle,
  DISPONIBLE: Coffee,
  AUTOMATICA: CircleCheck,
};

function Indicador({ label, value, detail, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{detail}</p>
        </div>
        <div className={`rounded-full p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

Indicador.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  detail: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
};

export default function PageMiDia() {
  const {
    estado,
    isLoading,
    error,
    categorias,
    iniciarActividad,
    marcarDisponible,
    completarActividad,
    bloquearActividad,
    cancelarActividad,
    reanudarActividad,
  } = useMiDia();

  const [modo, setModo] = useState(null); // "tarea" | "otra" | "completar" | "bloquear" | null
  const [sugerenciasTarea, setSugerenciasTarea] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [form, setForm] = useState({ categoria_id: "", titulo: "", descripcion: "", resultado: "", observacion: "", motivo_bloqueo: "" });

  // Sugerencias de tareas ya escritas antes por el usuario (busqueda en vivo, con debounce)
  useEffect(() => {
    if (modo !== "tarea") return;
    setLoadingSugerencias(true);
    const timer = setTimeout(() => {
      miDiaService.getSugerenciasTarea({ q: form.titulo || undefined })
        .then((res) => setSugerenciasTarea(res.data?.data ?? []))
        .catch(() => setSugerenciasTarea([]))
        .finally(() => setLoadingSugerencias(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [modo, form.titulo]);

  const jornada = estado?.jornada;
  const actividadActiva = estado?.actividad_activa;
  const resumen = estado?.resumen;
  const lineaTiempo = useMemo(() => estado?.linea_tiempo ?? [], [estado]);

  const estadoBadge = ESTADO_BADGE[jornada?.estado_actual] ?? ESTADO_BADGE.DISPONIBLE;

  const cerrarModo = () => {
    setModo(null);
    setForm({ categoria_id: "", titulo: "", descripcion: "", resultado: "", observacion: "", motivo_bloqueo: "" });
  };

  const handleIniciarTarea = (e) => {
    e.preventDefault();
    if (!form.titulo?.trim()) {
      showToast("error", "Escribe qué vas a hacer.");
      return;
    }
    iniciarActividad.mutate(
      { tipo: "TAREA", titulo: form.titulo.trim(), descripcion: form.descripcion || undefined },
      { onSuccess: cerrarModo }
    );
  };

  const handleIniciarOtra = (e) => {
    e.preventDefault();
    iniciarActividad.mutate(
      { tipo: "OTRA_ACTIVIDAD", categoria_id: Number(form.categoria_id), titulo: form.titulo, descripcion: form.descripcion },
      { onSuccess: cerrarModo }
    );
  };

  const handleCompletar = (e) => {
    e.preventDefault();
    completarActividad.mutate(
      { uuid: actividadActiva.uuid, data: { resultado: form.resultado, observacion: form.observacion } },
      { onSuccess: cerrarModo }
    );
  };

  const handleBloquear = (e) => {
    e.preventDefault();
    bloquearActividad.mutate(
      { uuid: actividadActiva.uuid, data: { motivo_bloqueo: form.motivo_bloqueo } },
      { onSuccess: cerrarModo }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <NexusLoader text="Cargando Mi Día" />
      </div>
    );
  }

  if (error) {
    const mensaje = error.response?.data?.errors
      ? Object.values(error.response.data.errors).flat().join(" | ")
      : "No se pudo cargar Mi Día.";
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{mensaje}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Sun className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mi Día</h1>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>Productividad</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Mi día</span>
            </nav>
          </div>
        </div>
        <span className={`inline-flex items-center justify-center self-start rounded-full px-4 py-2 text-sm font-semibold md:self-auto ${estadoBadge.color}`}>
          {estadoBadge.label}
        </span>
      </div>

      {/* Indicadores */}
      {resumen && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Indicador
            label="Entrada"
            value={fmtHora(jornada?.work_session?.hora_entrada)}
            detail="Registrada por el kiosko"
            icon={Clock}
            color="bg-blue-50 text-blue-600"
          />
          <Indicador
            label="Tiempo clasificado"
            value={minsToHM(resumen.minutos_tarea + resumen.minutos_otra_actividad + resumen.minutos_disponible)}
            detail={`De ${minsToHM(resumen.minutos_clasificable)} disponibles hoy`}
            icon={Timer}
            color="bg-indigo-50 text-indigo-600"
          />
          <Indicador
            label="Pausas y almuerzo"
            value={minsToHM(resumen.minutos_pausa + resumen.minutos_almuerzo)}
            detail="Según marcaciones del kiosko"
            icon={CircleCheck}
            color="bg-emerald-50 text-emerald-600"
          />
          <Indicador
            label="Sin clasificar"
            value={minsToHM(resumen.minutos_sin_clasificar)}
            detail="Tiempo aún sin explicar hoy"
            icon={CircleAlert}
            color="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {/* Actividad activa o acciones */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            {actividadActiva ? "Actividad actual" : "¿Qué vas a hacer ahora?"}
          </h3>
        </div>

        <div className="p-5">
          {actividadActiva ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    {(() => {
                      const Icon = TIPO_ICONO[actividadActiva.tipo] ?? ListTodo;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </div>
                  <p className="text-base font-bold text-gray-800">
                    {actividadActiva.titulo || actividadActiva.tarea?.nombre || actividadActiva.categoria?.nombre || actividadActiva.tipo}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_ACTIVIDAD_BADGE[actividadActiva.estado]}`}>
                  {actividadActiva.estado}
                </span>
              </div>

              {modo === "completar" ? (
                <form onSubmit={handleCompletar} className="space-y-2">
                  <textarea
                    required
                    placeholder="Resultado obtenido..."
                    value={form.resultado}
                    onChange={(e) => setForm((p) => ({ ...p, resultado: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                  <input
                    placeholder="Observación (opcional)"
                    value={form.observacion}
                    onChange={(e) => setForm((p) => ({ ...p, observacion: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={completarActividad.isPending} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                      Confirmar
                    </button>
                    <button type="button" onClick={cerrarModo} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : modo === "bloquear" ? (
                <form onSubmit={handleBloquear} className="space-y-2">
                  <textarea
                    required
                    placeholder="Motivo del bloqueo..."
                    value={form.motivo_bloqueo}
                    onChange={(e) => setForm((p) => ({ ...p, motivo_bloqueo: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                  />
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={bloquearActividad.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                      Confirmar bloqueo
                    </button>
                    <button type="button" onClick={cerrarModo} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {actividadActiva.estado === "PAUSADA" ? (
                    <button
                      onClick={() => reanudarActividad.mutate(actividadActiva.uuid)}
                      disabled={reanudarActividad.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" /> Reanudar actividad
                    </button>
                  ) : <>
                  <button onClick={() => setModo("completar")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                    <CheckCircle2 className="h-4 w-4" /> Completar
                  </button>
                  <button onClick={() => setModo("bloquear")} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                    <Ban className="h-4 w-4" /> Bloquear
                  </button>
                  </>}
                  <button
                    onClick={() => cancelarActividad.mutate(actividadActiva.uuid)}
                    disabled={cancelarActividad.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Cancelar actividad
                  </button>
                </div>
              )}
            </div>
          ) : modo === "tarea" ? (
            <form onSubmit={handleIniciarTarea} className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">¿Qué vas a hacer?</label>
              <CreatableSelect
                options={sugerenciasTarea.map((t) => ({ value: t, label: t }))}
                value={form.titulo ? { value: form.titulo, label: form.titulo } : null}
                onChange={(option) => setForm((p) => ({ ...p, titulo: option ? option.value : "" }))}
                onInputChange={(value, meta) => {
                  if (meta.action === "input-change") setForm((p) => ({ ...p, titulo: value }));
                }}
                inputValue={form.titulo}
                placeholder="Escribe la tarea..."
                formatCreateLabel={(value) => `Usar "${value}"`}
                isClearable
                autoFocus
                isLoading={loadingSugerencias}
                noOptionsMessage={() => "Sin sugerencias todavía, solo escribe"}
                classNamePrefix="rs"
                styles={{ control: (base) => ({ ...base, minHeight: "38px", fontSize: "14px" }) }}
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={iniciarActividad.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  Iniciar
                </button>
                <button type="button" onClick={cerrarModo} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Cancelar
                </button>
              </div>
            </form>
          ) : modo === "otra" ? (
            <form onSubmit={handleIniciarOtra} className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Categoría</label>
              <select
                required
                value={form.categoria_id}
                onChange={(e) => setForm((p) => ({ ...p, categoria_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <input
                required
                placeholder="Título breve"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={iniciarActividad.isPending} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
                  Iniciar
                </button>
                <button type="button" onClick={cerrarModo} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => setModo("tarea")}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <ListTodo className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Agregar tarea del día</span>
              </button>
              <button
                onClick={() => setModo("otra")}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Otra actividad</span>
              </button>
              <button
                onClick={() => marcarDisponible.mutate()}
                disabled={marcarDisponible.isPending}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors disabled:opacity-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  {marcarDisponible.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Coffee className="h-5 w-5" />}
                </div>
                <span className="text-sm font-semibold text-gray-700">Estoy disponible</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Línea de tiempo */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Línea de tiempo de hoy</h3>
        </div>
        <div className="p-5">
          {lineaTiempo.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-400">
              Aún no hay actividades registradas hoy.
            </div>
          ) : (
            <div className="space-y-2">
              {lineaTiempo.map((item) => {
                const Icon = TIPO_ICONO[item.tipo] ?? ListTodo;
                return (
                  <div key={item.uuid} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="w-24 shrink-0 font-mono text-xs text-gray-500">
                        {fmtHora(item.inicio_at)} – {fmtHora(item.fin_at)}
                      </span>
                      <span className="font-medium text-gray-800 truncate">
                        {item.titulo || item.tarea?.nombre || item.categoria?.nombre || item.tipo}
                      </span>
                    </div>
                    <span className={`ml-3 shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_ACTIVIDAD_BADGE[item.estado]}`}>
                      {item.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
