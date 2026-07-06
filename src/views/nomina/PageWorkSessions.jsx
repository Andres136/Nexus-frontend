import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import Select from "react-select";
import {
  Search,
  Loader2,
  Clock,
  Calendar,
  CircleCheck,
  CircleAlert,
  Timer,
  Users,
} from "lucide-react";
import { useGetWorkSessions } from "../../hooks/nomina/useGetWorkSessions";
import { useGetEmpleados } from "../../hooks/nomina/useGetEmpleados";
import { useSedes } from "../../hooks/useSedes";
import { recuperacionTiempoService, workSessionService } from "../../services/nominaService";
import { showToast } from "../../helpers/utils/showToast";

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
  const value = String(dt);
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);

  if (hasTimezone) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
      });
    }
  }

  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})/);
  if (!match) return "—";

  const hour = Number(match[1]);
  const minute = match[2];
  const hour12 = hour % 12 || 12;
  const suffix = hour >= 12 ? "p. m." : "a. m.";
  return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
}

function fechaLocal(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function rangoQuincena(tipo, base = new Date()) {
  const yyyy = base.getFullYear();
  const mm = base.getMonth();
  const inicio = new Date(yyyy, mm, tipo === "primera" ? 1 : 16);
  const fin = tipo === "primera"
    ? new Date(yyyy, mm, 15)
    : new Date(yyyy, mm + 1, 0);

  return {
    inicio: fechaLocal(inicio),
    fin: fechaLocal(fin),
  };
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

function Indicador({ label, value, detail, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
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

Pagination.propTypes = {
  meta: PropTypes.shape({
    last_page: PropTypes.number,
    from: PropTypes.number,
    to: PropTypes.number,
    total: PropTypes.number,
  }),
  page: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};

export default function PageWorkSessions() {
  const queryClient = useQueryClient();
  const today = fechaLocal();
  const firstDay = today.slice(0, 8) + "01";

  const [search, setSearch]         = useState("");
  const [fechaInicio, setFechaInicio] = useState(firstDay);
  const [fechaFin, setFechaFin]     = useState(today);
  const [sedeId, setSedeId]         = useState("");
  const [userId, setUserId]         = useState("");
  const [page, setPage]             = useState(1);
  const [recuperacionForm, setRecuperacionForm] = useState({
    fecha: today,
    hora_inicio: "",
    hora_fin: "",
    motivo: "",
  });
  const { sedes } = useSedes();
  const { empleados, isLoading: loadingEmpleados } = useGetEmpleados({ con_contrato: true });
  const sedesLista = Array.isArray(sedes) ? sedes : [];
  const empleadoSeleccionado =
    empleados.find((empleado) => String(empleado.value) === String(userId)) ?? null;

  const params = useMemo(() => ({
    user_id:      userId || undefined,
    search:       search || undefined,
    fecha_inicio: fechaInicio || undefined,
    fecha_fin:    fechaFin    || undefined,
    sede_id:      sedeId || undefined,
    page,
    per_page: 15,
  }), [userId, search, fechaInicio, fechaFin, sedeId, page]);

  const dailyParams = useMemo(() => ({
    user_id: userId || undefined,
    fecha: today,
    sede_id: sedeId || undefined,
    per_page: 1000,
  }), [userId, sedeId, today]);

  const { workSessions, isLoading } = useGetWorkSessions(params);
  const { workSessions: dailyWorkSessions, isLoading: loadingDaily } =
    useGetWorkSessions(dailyParams);
  const { data: resumenPeriodo, isFetching: loadingResumen } = useQuery({
    queryKey: ["workSessionsResumen", userId, fechaInicio, fechaFin],
    queryFn: async () => {
      const response = await workSessionService.getResumen({
        user_id: userId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });

      return response.data?.data;
    },
    enabled: !!userId && !!fechaInicio && !!fechaFin,
  });
  const { data: recuperacionesData } = useQuery({
    queryKey: ["recuperacionesTiempo", userId, fechaInicio, fechaFin],
    queryFn: async () => {
      const response = await recuperacionTiempoService.getRecuperaciones({
        user_id: userId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        per_page: 100,
      });

      return response.data?.data;
    },
    enabled: !!userId && !!fechaInicio && !!fechaFin,
  });
  const lista = useMemo(
    () => workSessions?.data?.data ?? [],
    [workSessions]
  );
  const meta  = workSessions?.data ?? null;
  const dailyList = useMemo(
    () => dailyWorkSessions?.data?.data ?? [],
    [dailyWorkSessions]
  );
  const dailyMeta = dailyWorkSessions?.data ?? null;
  const recuperaciones = recuperacionesData?.data ?? [];
  const resumen = useMemo(() => {
    return dailyList.reduce((acc, item) => {
      acc.minutosTrabajados += Number(item.minutos_trabajados ?? 0);
      acc.minutosTardanza += Number(item.minutos_tardanza ?? 0);
      if (Number(item.minutos_tardanza ?? 0) === 0) acc.aTiempo += 1;
      if (Number(item.minutos_tardanza ?? 0) > 0) acc.conTardanza += 1;
      if (item.hora_entrada && !item.hora_salida) acc.abiertas += 1;
      return acc;
    }, {
      minutosTrabajados: 0,
      minutosTardanza: 0,
      aTiempo: 0,
      conTardanza: 0,
      abiertas: 0,
    });
  }, [dailyList]);

  const handleSearch     = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFechaInicio = (e) => { setFechaInicio(e.target.value); setPage(1); };
  const handleFechaFin   = (e) => { setFechaFin(e.target.value); setPage(1); };
  const handleSede       = (e) => { setSedeId(e.target.value); setPage(1); };
  const handleEmpleado = (option) => { setUserId(option?.value ?? ""); setPage(1); };
  const aplicarQuincena = (tipo) => {
    const rango = rangoQuincena(tipo);
    setFechaInicio(rango.inicio);
    setFechaFin(rango.fin);
    setPage(1);
  };
  const handleRecuperacion = (event) => {
    const { name, value } = event.target;
    setRecuperacionForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setRecuperacionForm((prev) => ({ ...prev, fecha: fechaFin || today }));
  }, [fechaFin, today]);

  const recuperacionMutation = useMutation({
    mutationFn: (payload) => recuperacionTiempoService.createRecuperacion(payload),
    onSuccess: (response) => {
      showToast("success", response.data?.message || "Recuperación autorizada");
      setRecuperacionForm({ fecha: fechaFin || today, hora_inicio: "", hora_fin: "", motivo: "" });
      queryClient.invalidateQueries({ queryKey: ["recuperacionesTiempo"] });
      queryClient.invalidateQueries({ queryKey: ["workSessionsResumen"] });
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "No fue posible autorizar la recuperación");
    },
  });

  const guardarRecuperacion = (event) => {
    event.preventDefault();

    if (!userId) {
      showToast("error", "Selecciona un empleado.");
      return;
    }

    recuperacionMutation.mutate({
      user_id: Number(userId),
      ...recuperacionForm,
      motivo: recuperacionForm.motivo || "Recuperación de tiempo autorizada",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Registro de Asistencia</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sesiones de trabajo registradas por el kiosko.</p>
        </div>
      </div>



      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          label="Registros de hoy"
          value={loadingDaily ? "—" : (dailyMeta?.total ?? 0)}
          detail={fmtFecha(today)}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <Indicador
          label="Trabajado hoy"
          value={loadingDaily ? "—" : minsToHM(resumen.minutosTrabajados)}
          detail="Total de todas las sesiones del día"
          icon={Timer}
          color="bg-indigo-50 text-indigo-600"
        />
        <Indicador
          label="A tiempo hoy"
          value={loadingDaily ? "—" : resumen.aTiempo}
          detail={`${dailyList.length} sesiones registradas hoy`}
          icon={CircleCheck}
          color="bg-emerald-50 text-emerald-600"
        />
        <Indicador
          label="Novedades de hoy"
          value={loadingDaily ? "—" : resumen.abiertas + resumen.conTardanza}
          detail={`${resumen.abiertas} abiertas · ${resumen.conTardanza} con tardanza`}
          icon={CircleAlert}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {userId && (
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Resumen de período</p>
                <p className="text-xs text-gray-500">
                  {empleadoSeleccionado?.label ?? "Empleado"} · {fmtFecha(fechaInicio)} a {fmtFecha(fechaFin)}
                </p>
              </div>
              {loadingResumen && (
                <span className="inline-flex items-center gap-1 text-xs text-indigo-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Actualizando
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Indicador label="Horas que debe" value={minsToHM(resumenPeriodo?.minutos_debe)} detail={`${resumenPeriodo?.sesiones ?? 0} sesiones en el período`} icon={Clock} color="bg-slate-50 text-slate-600" />
              <Indicador label="Trabajadas" value={minsToHM(resumenPeriodo?.minutos_trabajados)} detail="Según marcaciones del kiosko" icon={Timer} color="bg-indigo-50 text-indigo-600" />
              <Indicador label="Tardanza" value={minsToHM(resumenPeriodo?.minutos_tardanza)} detail={`${resumenPeriodo?.dias_tarde ?? 0} día(s) tarde`} icon={CircleAlert} color="bg-orange-50 text-orange-600" />
              <Indicador label="Saldo pendiente" value={minsToHM(resumenPeriodo?.minutos_saldo)} detail={`${minsToHM(resumenPeriodo?.minutos_recuperados)} recuperado`} icon={CircleCheck} color="bg-emerald-50 text-emerald-600" />
            </div>
          </div>

          <form onSubmit={guardarRecuperacion} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Autorizar recuperación</p>
            <p className="mt-0.5 text-xs text-gray-500">
              El kiosko reconocerá este tiempo como compensación, no como hora extra.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <input type="date" name="fecha" value={recuperacionForm.fecha} onChange={handleRecuperacion} className="h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="time" name="hora_inicio" value={recuperacionForm.hora_inicio} onChange={handleRecuperacion} className="h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="time" name="hora_fin" value={recuperacionForm.hora_fin} onChange={handleRecuperacion} className="h-9 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <input type="text" name="motivo" value={recuperacionForm.motivo} onChange={handleRecuperacion} placeholder="Motivo" className="mt-2 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />

            <button type="submit" disabled={recuperacionMutation.isPending} className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {recuperacionMutation.isPending ? "Autorizando..." : "Autorizar recuperación"}
            </button>

            {recuperaciones.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Autorizadas</p>
                <div className="space-y-1.5">
                  {recuperaciones.slice(0, 3).map((item) => (
                    <div key={item.uuid} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5 text-xs">
                      <span className="text-gray-600">
                        {fmtFecha(item.fecha)} · {item.hora_inicio?.slice(0, 5)}-{item.hora_fin?.slice(0, 5)}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {minsToHM(item.minutos_usados)} / {minsToHM(item.minutos_autorizados)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="min-w-[260px]">
          <Select
            className="text-sm"
            classNamePrefix="react-select"
            options={empleados}
            value={empleadoSeleccionado}
            onChange={handleEmpleado}
            isClearable
            isSearchable
            isLoading={loadingEmpleados}
            placeholder={loadingEmpleados ? "Cargando empleados..." : "Filtrar empleado"}
            noOptionsMessage={() => "Sin empleados"}
          />
        </div>

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

        <select
          value={sedeId}
          onChange={handleSede}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todas las sedes</option>
          {sedesLista.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre ?? sede.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => aplicarQuincena("primera")}
            className="h-7 rounded-md px-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            1a quincena
          </button>
          <button
            type="button"
            onClick={() => aplicarQuincena("segunda")}
            className="h-7 rounded-md px-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            2a quincena
          </button>
        </div>
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
                    "Pausa", "Almuerzo", "Trabajado", "Pausa", "Min almuerzo",
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

                      {/* Min almuerzo */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {minsToHM(item.minutos_almuerzo)}
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
