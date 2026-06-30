import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  CalendarDays,
  Check,
  Clock,
  ClipboardList,
  Filter,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCapacitaciones } from "../../hooks/capacitaciones/useCapacitaciones";

const ESTADOS = {
  programada: { label: "Programada", color: "#2563eb", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  realizada: { label: "Realizada", color: "#16a34a", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelada: { label: "Cancelada", color: "#dc2626", badge: "bg-red-50 text-red-700 border-red-200" },
};

const emptyForm = {
  titulo: "",
  descripcion: "",
  fecha_realizacion: "",
  hora_inicio: "",
  hora_fin: "",
  lugar: "",
  modalidad: "presencial",
  estado: "programada",
};

const formatTime = (value) => (value ? String(value).slice(0, 5) : "");

const nombreUsuario = (usuario) => {
  if (!usuario) return "Sin usuario";
  return [usuario.name, usuario.apellidos].filter(Boolean).join(" ") || usuario.email || "Sin usuario";
};

const getBadge = (estado) => ESTADOS[estado] ?? ESTADOS.programada;
const today = new Date().toISOString().slice(0, 10);

export default function PageCapacitaciones() {
  const [filters, setFilters] = useState({
    search: "",
    fecha_desde: "",
    fecha_hasta: "",
    estado: "",
    propias: false,
    page: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      propias: filters.propias ? 1 : undefined,
      search: filters.search || undefined,
      fecha_desde: filters.fecha_desde || undefined,
      fecha_hasta: filters.fecha_hasta || undefined,
      estado: filters.estado || undefined,
      page: filters.page,
      per_page: 25,
    }),
    [filters]
  );

  const {
    capacitaciones,
    isLoading,
    isFetching,
    crearCapacitacion,
    isCreando,
    actualizarCapacitacion,
    isActualizando,
    eliminarCapacitacion,
    isEliminando,
    pagination,
  } = useCapacitaciones(queryFilters);

  const updateFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  };

  const changePage = (page) => {
    setFilters((current) => ({ ...current, page }));
  };

  const eventos = useMemo(
    () =>
      capacitaciones.map((capacitacion) => {
        const estado = getBadge(capacitacion.estado);
        const start = capacitacion.hora_inicio
          ? `${capacitacion.fecha_realizacion}T${formatTime(capacitacion.hora_inicio)}`
          : capacitacion.fecha_realizacion;
        const end = capacitacion.hora_fin
          ? `${capacitacion.fecha_realizacion}T${formatTime(capacitacion.hora_fin)}`
          : undefined;

        return {
          id: capacitacion.uuid,
          title: capacitacion.titulo,
          start,
          end,
          allDay: !capacitacion.hora_inicio,
          backgroundColor: estado.color,
          borderColor: estado.color,
          extendedProps: { capacitacion },
        };
      }),
    [capacitaciones]
  );

  const openCreate = (fecha = "") => {
    setSelected(null);
    setFormData({ ...emptyForm, fecha_realizacion: fecha && fecha >= today ? fecha : "" });
    setModalOpen(true);
  };

  const openEdit = (capacitacion) => {
    setSelected(capacitacion);
    setFormData({
      titulo: capacitacion.titulo ?? "",
      descripcion: capacitacion.descripcion ?? "",
      fecha_realizacion: capacitacion.fecha_realizacion ?? "",
      hora_inicio: formatTime(capacitacion.hora_inicio),
      hora_fin: formatTime(capacitacion.hora_fin),
      lugar: capacitacion.lugar ?? "",
      modalidad: capacitacion.modalidad ?? "presencial",
      estado: capacitacion.estado ?? "programada",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      hora_inicio: formData.hora_inicio || null,
      hora_fin: formData.hora_fin || null,
      descripcion: formData.descripcion || null,
      lugar: formData.lugar || null,
    };

    if (selected) {
      actualizarCapacitacion({ uuid: selected.uuid, data: payload }, { onSuccess: closeModal });
      return;
    }

    crearCapacitacion(payload, { onSuccess: closeModal });
  };

  const handleDelete = () => {
    if (!selected) return;
    eliminarCapacitacion(selected.uuid, { onSuccess: closeModal });
  };

  const statsDelMes = useMemo(() => {
    const ahora = new Date();
    const mes = ahora.getMonth();
    const anio = ahora.getFullYear();
    const delMes = capacitaciones.filter((cap) => {
      const fecha = new Date(cap.fecha_realizacion + "T00:00:00");
      return fecha.getMonth() === mes && fecha.getFullYear() === anio;
    });
    const realizadas = delMes.filter((cap) => cap.estado === "realizada").length;
    const total = delMes.length;
    return {
      total,
      realizadas,
      noRealizadas: total - realizadas,
      porcentaje: total > 0 ? Math.round((realizadas / total) * 100) : 0,
    };
  }, [capacitaciones]);

  const isSaving = isCreando || isActualizando;
  const canEditSelected = !selected || selected.puede_editar;
  const editMessage = selected?.fecha_pasada
    ? "La fecha de realización ya pasó."
    : "Solo el usuario que creó la capacitación puede editarla.";

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              Talento humano
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Calendario de capacitaciones</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/auth/capacitaciones/encuestas"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
            >
              <ClipboardList className="h-4 w-4" />
              Encuestas
            </Link>
            <button
              type="button"
              onClick={() => openCreate()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nueva capacitación
            </button>
          </div>
        </header>

        <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1.4fr_0.75fr_0.75fr_0.65fr_auto]">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Buscar
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilters({ search: event.target.value })}
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Título, lugar o creador"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Desde
            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(event) => updateFilters({ fecha_desde: event.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Hasta
            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(event) => updateFilters({ fecha_hasta: event.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Estado
            <select
              value={filters.estado}
              onChange={(event) => updateFilters({ estado: event.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos</option>
              <option value="programada">Programada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>

          <label className="flex items-center gap-2 self-end rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filters.propias}
              onChange={(event) => updateFilters({ propias: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Mis registros
          </label>
        </section>

        <section className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="min-w-[120px]">
              <p className="text-xs font-medium text-slate-500">Mes actual</p>
              <p className="mt-0.5 text-3xl font-bold text-slate-950">
                {statsDelMes.porcentaje}
                <span className="text-lg font-semibold text-slate-400">%</span>
              </p>
              <p className="text-xs text-slate-500">ejecutadas</p>
            </div>
            <div className="flex grow flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-emerald-700">{statsDelMes.realizadas} realizadas</span>
                <span className="text-slate-400">{statsDelMes.noRealizadas} pendientes / canceladas</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${statsDelMes.porcentaje}%` }}
                />
              </div>
              <p className="text-right text-xs text-slate-400">{statsDelMes.total} total este mes</p>
            </div>
          </div>
        </section>

        <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                  <Filter className="h-4 w-4" />
                  {pagination?.total ?? capacitaciones.length} registros
                </span>
                {Object.entries(ESTADOS).map(([key, estado]) => (
                  <span key={key} className="inline-flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: estado.color }} />
                    {estado.label}
                  </span>
                ))}
              </div>
              {isFetching && (
                <span className="inline-flex items-center gap-2 text-xs font-medium text-blue-700">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Actualizando
                </span>
              )}
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="es"
              firstDay={1}
              height="auto"
              events={eventos}
              dateClick={(info) => openCreate(info.dateStr)}
              eventClick={(info) => openEdit(info.event.extendedProps.capacitacion)}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth",
              }}
              buttonText={{ today: "Hoy", month: "Mes" }}
              dayMaxEvents={3}
              eventDisplay="block"
              eventContent={(arg) => {
                const cap = arg.event.extendedProps.capacitacion;
                const color = getBadge(cap?.estado)?.color ?? "#2563eb";
                return (
                  <div style={{ overflow: "hidden", padding: "1px 4px", display: "flex", alignItems: "center", gap: "4px", backgroundColor: color, borderRadius: "3px", color: "white" }}>
                    {cap?.encuestas_count > 0 && (
                      <ClipboardList style={{ width: 10, height: 10, flexShrink: 0, opacity: 0.85 }} />
                    )}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                      {arg.event.title}
                    </span>
                  </div>
                );
              }}
            />
          </section>

          <aside className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-950">Capacitaciones</h2>
                {pagination && (
                  <span className="text-xs font-medium text-slate-500">
                    Pag. {pagination.current_page} de {pagination.last_page}
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-[760px] divide-y divide-slate-100 overflow-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando capacitaciones
                </div>
              ) : capacitaciones.length === 0 ? (
                <div className="px-4 py-8 text-sm text-slate-500">No hay capacitaciones con estos filtros.</div>
              ) : (
                capacitaciones.map((capacitacion) => {
                  const estado = getBadge(capacitacion.estado);
                  return (
                    <button
                      key={capacitacion.uuid}
                      type="button"
                      onClick={() => openEdit(capacitacion)}
                      className="block w-full px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-950">{capacitacion.titulo}</h3>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {capacitacion.encuestas_count > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                              <ClipboardList className="h-2.5 w-2.5" />
                              {capacitacion.encuestas_count}
                            </span>
                          )}
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${estado.badge}`}>
                            {estado.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {capacitacion.fecha_realizacion}
                          {capacitacion.hora_inicio ? ` ${formatTime(capacitacion.hora_inicio)}` : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {nombreUsuario(capacitacion.creador)}
                        </span>
                        {capacitacion.lugar && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {capacitacion.lugar}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
                <button
                  type="button"
                  onClick={() => changePage(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1 || isFetching}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-xs text-slate-500">
                  {pagination.from ?? 0}-{pagination.to ?? 0} de {pagination.total}
                </span>
                <button
                  type="button"
                  onClick={() => changePage(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page || isFetching}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </aside>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-6">
          <div className="max-h-full w-full max-w-2xl overflow-auto rounded-md bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {selected ? "Editar capacitación" : "Nueva capacitación"}
                </h2>
                {selected && (
                  <p className="mt-1 text-sm text-slate-500">Creada por {nombreUsuario(selected.creador)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selected && !canEditSelected && (
              <div className="mx-5 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                {editMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Título
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(event) => setFormData((current) => ({ ...current, titulo: event.target.value }))}
                  disabled={!canEditSelected}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Fecha
                  <input
                    type="date"
                    min={today}
                    value={formData.fecha_realizacion}
                    onChange={(event) => setFormData((current) => ({ ...current, fecha_realizacion: event.target.value }))}
                    disabled={!canEditSelected}
                    required
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Inicio
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(event) => setFormData((current) => ({ ...current, hora_inicio: event.target.value }))}
                    disabled={!canEditSelected}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Fin
                  <input
                    type="time"
                    value={formData.hora_fin}
                    onChange={(event) => setFormData((current) => ({ ...current, hora_fin: event.target.value }))}
                    disabled={!canEditSelected}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Modalidad
                  <select
                    value={formData.modalidad}
                    onChange={(event) => setFormData((current) => ({ ...current, modalidad: event.target.value }))}
                    disabled={!canEditSelected}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="mixta">Mixta</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Estado
                  <select
                    value={formData.estado}
                    onChange={(event) => setFormData((current) => ({ ...current, estado: event.target.value }))}
                    disabled={!canEditSelected}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="programada">Programada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Lugar
                  <input
                    type="text"
                    value={formData.lugar}
                    onChange={(event) => setFormData((current) => ({ ...current, lugar: event.target.value }))}
                    disabled={!canEditSelected}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Descripción
                <textarea
                  value={formData.descripcion}
                  onChange={(event) => setFormData((current) => ({ ...current, descripcion: event.target.value }))}
                  disabled={!canEditSelected}
                  rows={4}
                  className="resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
                <div>
                  {selected && canEditSelected && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isEliminando}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {isEliminando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </button>
                  {canEditSelected && (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : selected ? <Pencil className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      Guardar
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
