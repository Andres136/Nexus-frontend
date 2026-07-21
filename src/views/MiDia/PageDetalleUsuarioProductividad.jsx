import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, Coffee, ListTodo, PauseCircle,
  PlusCircle, TimerOff, CheckCircle2, AlertTriangle, Pencil,
} from "lucide-react";
import { useCorregirActividad, useUsuarioProductividad } from "../../hooks/useMiDiaAdmin";
import NexusLoader from "../../components/NexusLoader";
import AccesoDenegado from "../../components/AccesoDenegado";
import ModalCorregirActividad from "../../components/productividad/ModalCorregirActividad";

const pad = (value) => String(value).padStart(2, "0");
const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function rangoMes() {
  const hoy = new Date();
  return { inicio: iso(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), fin: iso(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)) };
}

function rangoSemana() {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return { inicio: iso(lunes), fin: iso(domingo) };
}

function formatMinutos(value) {
  const total = Math.max(0, Math.round(Number(value) || 0));
  const horas = Math.floor(total / 60);
  const minutos = total % 60;
  return horas ? `${horas} h ${minutos ? `${minutos} min` : ""}`.trim() : `${minutos} min`;
}

function formatFecha(value) {
  if (!value) return "—";
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" });
}

function formatHora(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function Kpi({ icon: Icon, label, value, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600", gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-4 w-4" /></div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

Kpi.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tone: PropTypes.oneOf(["indigo", "emerald", "amber", "rose", "sky", "gray"]),
};

export default function PageDetalleUsuarioProductividad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mes = useMemo(rangoMes, []);
  const fechaInicio = searchParams.get("fecha_inicio") || mes.inicio;
  const fechaFin = searchParams.get("fecha_fin") || mes.fin;
  const [actividadCorregir, setActividadCorregir] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const { detalle, isLoading, error } = useUsuarioProductividad(Number(id), { fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  const corregir = useCorregirActividad();

  const cambiarRango = (inicio, fin) => {
    setSearchParams({ fecha_inicio: inicio, fecha_fin: fin });
    setDiaSeleccionado(null);
  };
  const seleccionarPreset = (preset) => {
    const rango = preset === "semana" ? rangoSemana() : rangoMes();
    cambiarRango(rango.inicio, rango.fin);
  };

  const dias = detalle?.dias ?? [];
  const diaActivo = dias.find((dia) => dia.fecha === diaSeleccionado) ?? null;
  const totales = detalle?.totales ?? {};

  if (error?.response?.status === 403) return <AccesoDenegado mensaje="Este detalle es exclusivo del administrador." />;

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <button onClick={() => navigate("/auth/admin/productividad")} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-4 w-4" /> Volver al equipo
        </button>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div><h1 className="text-xl font-bold text-gray-800">{detalle?.usuario?.name || "Detalle de productividad"}</h1><p className="text-sm text-gray-500">{detalle?.usuario?.email}</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => seleccionarPreset("semana")} className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Esta semana</button>
            <button onClick={() => seleccionarPreset("mes")} className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Este mes</button>
            <input aria-label="Fecha de inicio" type="date" value={fechaInicio} max={fechaFin} onChange={(e) => cambiarRango(e.target.value, fechaFin)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <input aria-label="Fecha final" type="date" value={fechaFin} min={fechaInicio} onChange={(e) => cambiarRango(fechaInicio, e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </header>

      {isLoading && <NexusLoader text="Cargando detalle de productividad" />}
      {error && error.response?.status !== 403 && <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error.response?.data?.message || "No se pudo cargar el detalle."}</p>}

      {!isLoading && detalle && <>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
          <Kpi icon={CalendarDays} label="Jornada" value={formatMinutos(totales.minutos_jornada)} />
          <Kpi icon={ListTodo} label="En tareas" value={formatMinutos(totales.minutos_tarea)} tone="indigo" />
          <Kpi icon={PlusCircle} label="Otras actividades" value={formatMinutos(totales.minutos_otra_actividad)} tone="sky" />
          <Kpi icon={Coffee} label="Disponible declarado" value={formatMinutos(totales.minutos_disponible)} tone="emerald" />
          <Kpi icon={TimerOff} label="Parado sin actividad" value={formatMinutos(totales.minutos_parado)} tone="rose" />
          <Kpi icon={PauseCircle} label="Pausas y almuerzo" value={formatMinutos((totales.minutos_pausa || 0) + (totales.minutos_almuerzo || 0))} tone="amber" />
          <Kpi icon={CheckCircle2} label="Tiempo clasificado" value={totales.porcentaje_clasificado == null ? "—" : `${totales.porcentaje_clasificado}%`} tone="emerald" />
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Kpi icon={ListTodo} label="Tareas pendientes" value={detalle.tareas?.pendientes ?? 0} />
          <Kpi icon={CheckCircle2} label="Tareas completadas" value={detalle.tareas?.completadas ?? 0} tone="emerald" />
          <Kpi icon={AlertTriangle} label="Tareas bloqueadas" value={detalle.tareas?.bloqueadas ?? 0} tone="rose" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4"><h2 className="font-semibold text-gray-800">Productividad por día</h2><p className="text-xs text-gray-500">Selecciona un día para revisar su línea de tiempo.</p></div>
          {dias.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">No hay jornadas en el periodo seleccionado.</p> :
            <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Entrada</th><th className="px-4 py-3">Salida</th><th className="px-4 py-3">Tareas</th><th className="px-4 py-3">Disponible</th><th className="px-4 py-3">Parado</th><th className="px-4 py-3">Estado</th></tr></thead>
              <tbody>{dias.map((dia) => <tr key={`${dia.fecha}-${dia.work_session?.hora_entrada || "sin"}`} onClick={() => setDiaSeleccionado(dia.fecha)} className={`cursor-pointer border-t border-gray-100 hover:bg-indigo-50/40 ${diaSeleccionado === dia.fecha ? "bg-indigo-50" : ""}`}><td className="px-4 py-3 font-medium text-gray-800">{formatFecha(dia.fecha)}</td><td className="px-4 py-3">{formatHora(dia.work_session?.hora_entrada)}</td><td className="px-4 py-3">{dia.provisional ? "En curso" : formatHora(dia.work_session?.hora_salida)}</td><td className="px-4 py-3">{formatMinutos(dia.resumen?.minutos_tarea)}</td><td className="px-4 py-3">{formatMinutos(dia.resumen?.minutos_disponible)}</td><td className="px-4 py-3 font-semibold text-rose-600">{formatMinutos(dia.resumen?.minutos_parado)}</td><td className="px-4 py-3 text-xs">{dia.estado}</td></tr>)}</tbody></table></div>}
        </section>

        {diaActivo && <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold text-gray-800">Línea de tiempo · {formatFecha(diaActivo.fecha)}</h2>
          {(diaActivo.actividades ?? []).length === 0 ? <p className="text-sm text-gray-500">No inició actividades durante esta jornada.</p> : <div className="space-y-2">{diaActivo.actividades.map((actividad) => <div key={actividad.uuid} className="flex flex-col gap-2 rounded-lg bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-gray-800">{actividad.titulo || actividad.tarea?.nombre || actividad.categoria?.nombre || actividad.tipo}</p><p className="text-xs text-gray-500">{formatHora(actividad.inicio_at)} – {formatHora(actividad.fin_at)} · {actividad.estado}</p></div><button onClick={() => setActividadCorregir({ ...actividad, usuarioNombre: detalle.usuario?.name })} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600"><Pencil className="h-3 w-3" /> Corregir</button></div>)}</div>}
        </section>}

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold text-gray-800">Eventos verificables</h2>{(detalle.eventos ?? []).length === 0 ? <p className="text-sm text-gray-500">Sin eventos de compras o inventario en el periodo.</p> : <div className="space-y-2">{detalle.eventos.map((evento) => <div key={evento.uuid} className="rounded-lg bg-gray-50 p-3"><p className="text-sm font-medium text-gray-800">{evento.resumen || evento.tipo_evento}</p><p className="text-xs text-gray-500">{formatFecha(evento.ocurrio_at?.slice(0, 10))} · {formatHora(evento.ocurrio_at)}</p></div>)}</div>}</div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold text-gray-800">Correcciones administrativas</h2>{(detalle.correcciones ?? []).length === 0 ? <p className="text-sm text-gray-500">Sin correcciones en el periodo.</p> : <div className="space-y-2">{detalle.correcciones.map((item) => <div key={item.uuid} className="rounded-lg bg-gray-50 p-3"><p className="text-sm font-medium text-gray-800">{item.motivo}</p><p className="text-xs text-gray-500">Por {item.registrado_por?.name || "—"} · {formatHora(item.created_at)}</p></div>)}</div>}</div>
        </section>
      </>}

      {actividadCorregir && <ModalCorregirActividad actividad={actividadCorregir} onClose={() => setActividadCorregir(null)} onConfirm={(data) => corregir.mutate({ uuid: actividadCorregir.uuid, data }, { onSuccess: () => setActividadCorregir(null) })} loading={corregir.isPending} />}
    </div>
  );
}
