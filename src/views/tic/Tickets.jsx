import { useMemo, useState } from "react";
import Select from "react-select";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LifeBuoy,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Ticket as TicketIcon,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTickets } from "../../hooks/tic/useTickets";
import { useAuth } from "../../hooks/useAuth";

const ESTADOS = {
  pendiente: "bg-amber-100 text-amber-700",
  en_proceso: "bg-blue-100 text-blue-700",
  cerrado: "bg-green-100 text-green-700",
};

const PRIORIDADES = {
  baja: "bg-gray-100 text-gray-600",
  media: "bg-indigo-100 text-indigo-700",
  alta: "bg-red-100 text-red-700",
};

function fileUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
  return `${base}/storage/${path}`;
}

function filePaths(...values) {
  return values.flatMap((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  });
}

function selectedFileNames(files) {
  if (!files?.length) return "";
  return files.map((file) => file.name).join(", ");
}

function appendSelectedFiles(currentFiles, fileList) {
  return [...(currentFiles ?? []), ...Array.from(fileList ?? [])];
}

function fmtDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTicketDateTime(ticket, dateKey, timeKey, fallbackKey) {
  if (ticket?.[dateKey]) {
    return `${ticket[dateKey]} ${ticket?.[timeKey] ?? ""}`.trim();
  }

  return fmtDateTime(ticket?.[fallbackKey]);
}

function fmtTicketDelivery(ticket) {
  if (!ticket?.fecha_entrega) return "-";
  return `${ticket.fecha_entrega} ${ticket.hora_entrega?.slice(0, 5) ?? ""}`.trim();
}

export default function Tickets() {
  const { user } = useAuth({ middleware: "auth" });
  const {
    tickets,
    pagination,
    selectedTicket,
    filters,
    setFilters,
    form,
    updateForm,
    editForm,
    updateEditForm,
    editFieldErrors,
    commentForm,
    setCommentForm,
    usuarios,
    departamentos,
    asignacionesUsuario,
    loading,
    saving,
    fieldErrors,
    cargarDetalle,
    crearTicket,
    iniciarEdicion,
    cancelarEdicion,
    editarTicket,
    cambiarEstado,
    agregarComentario,
    eliminarTicket,
    updating,
    isUsuariosLoading,
    isAsignacionesLoading,
  } = useTickets(user?.id);

  const [showCreate, setShowCreate] = useState(false);
  const canEditSelectedTicket = selectedTicket && Number(selectedTicket.user_solicitante_id) === Number(user?.id);
  const canDeleteSelectedTicket = selectedTicket && Number(selectedTicket.user_solicitante_id) === Number(user?.id);
  const canChangeSelectedStatus = selectedTicket && Number(selectedTicket.user_asignado_id) === Number(user?.id);

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleCreate = async (event) => {
    const ok = await crearTicket(event);
    if (ok) setShowCreate(false);
  };

  const departamentoOptions = useMemo(
    () =>
      departamentos.map((departamento) => ({
        value: departamento.id,
        label: departamento.nombre,
      })),
    [departamentos]
  );

  const usuarioOptions = useMemo(
    () =>
      usuarios.map((usuario) => ({
        value: usuario.id,
        label: usuario.name,
      })),
    [usuarios]
  );

  const asignacionOptions = useMemo(
    () =>
      asignacionesUsuario.map((asignacion) => ({
        value: asignacion.id,
        label: `${asignacion.producto?.name ?? `Asignación #${asignacion.id}`} - ${
          asignacion.empresa?.nombre ?? "Sin empresa"
        }`,
      })),
    [asignacionesUsuario]
  );

  const selectedDepartamento =
    departamentoOptions.find((option) => String(option.value) === String(form.departamento_id)) ?? null;
  const selectedUsuario = usuarioOptions.find((option) => String(option.value) === String(form.user_asignado_id)) ?? null;
  const selectedAsignacion =
    asignacionOptions.find((option) => String(option.value) === String(form.asignacion_id)) ?? null;
  const selectedEditDepartamento =
    departamentoOptions.find((option) => String(option.value) === String(editForm?.departamento_id)) ?? null;
  const selectedEditUsuario =
    usuarioOptions.find((option) => String(option.value) === String(editForm?.user_asignado_id)) ?? null;
  const selectedEditAsignacion =
    asignacionOptions.find((option) => String(option.value) === String(editForm?.asignacion_id)) ?? null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-[100rem]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets TIC</h1>
            <p className="mt-0.5 text-xs text-gray-500">Solicitudes, equipos asignados y seguimiento técnico.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/auth/tic/indicadores-tickets"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-white"
            >
              <TicketIcon className="h-4 w-4" />
              Indicadores tickets
            </Link>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nuevo ticket
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => handleFilter("search", event.target.value)}
              placeholder="Buscar ticket..."
              className="h-9 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.estado}
            onChange={(event) => handleFilter("estado", event.target.value)}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <select
            value={filters.prioridad}
            onChange={(event) => handleFilter("prioridad", event.target.value)}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
          <select
            value={filters.per_page}
            onChange={(event) => handleFilter("per_page", event.target.value)}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[10, 20, 50].map((option) => (
              <option key={option} value={option}>{option} por página</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-sm text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
                Cargando tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <LifeBuoy className="mb-2 h-10 w-10" />
                <p className="text-sm">No hay tickets para mostrar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Ticket</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Asignado</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Equipo</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Prioridad</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Entrega</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Creación</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Cierre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => cargarDetalle(ticket.id)}
                        className="cursor-pointer hover:bg-blue-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">#{ticket.id}</p>
                          <p className="line-clamp-1 max-w-[320px] text-gray-500">{ticket.descripcion}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{ticket.asignado?.name ?? "Sin asignar"}</td>
                        <td className="px-4 py-3 text-gray-600">{ticket.producto?.name ?? "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORIDADES[ticket.prioridad] ?? PRIORIDADES.media}`}>
                            {ticket.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADOS[ticket.estado] ?? ESTADOS.pendiente}`}>
                            {ticket.estado?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{fmtTicketDelivery(ticket)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {fmtTicketDateTime(ticket, "fecha_creacion", "hora_creacion", "created_at")}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {fmtTicketDateTime(ticket, "fecha_cierre", "hora_cierre", "fecha_solucion")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {!selectedTicket ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-gray-400">
                <MessageSquare className="mb-2 h-10 w-10" />
                <p className="text-sm">Selecciona un ticket para ver el seguimiento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ticket #{selectedTicket.id}</p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-900">{selectedTicket.producto?.name ?? "Solicitud TIC"}</h2>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEditSelectedTicket && (
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(selectedTicket)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Editar ticket"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDeleteSelectedTicket && (
                      <button
                        type="button"
                        onClick={() => eliminarTicket(selectedTicket.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        title="Eliminar ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{selectedTicket.descripcion}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <p className="font-semibold text-gray-400">Solicitante</p>
                    <p className="text-sm text-gray-800">{selectedTicket.solicitante?.name ?? "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">Asignado</p>
                    <p className="text-sm text-gray-800">{selectedTicket.asignado?.name ?? "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">Entrega</p>
                    <p className="text-sm text-gray-800">{fmtTicketDelivery(selectedTicket)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500 sm:grid-cols-3">
                  <div>
                    <p className="font-semibold text-gray-400">Creación</p>
                    <p className="text-sm text-gray-800">
                      {fmtTicketDateTime(selectedTicket, "fecha_creacion", "hora_creacion", "created_at")}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">Edición</p>
                    <p className="text-sm text-gray-800">
                      {fmtTicketDateTime(selectedTicket, "fecha_edicion", "hora_edicion", "updated_at")}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-400">Cierre</p>
                    <p className="text-sm text-gray-800">
                      {fmtTicketDateTime(selectedTicket, "fecha_cierre", "hora_cierre", "fecha_solucion")}
                    </p>
                  </div>
                </div>

                {filePaths(selectedTicket.archivo, selectedTicket.archivos).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filePaths(selectedTicket.archivo, selectedTicket.archivos).map((path, index) => (
                      <a
                        key={`${path}-${index}`}
                        href={fileUrl(path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        <Paperclip className="h-4 w-4" />
                        Soporte {index + 1}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {["pendiente", "en_proceso", "cerrado"].map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => cambiarEstado(selectedTicket.id, estado)}
                      disabled={!canChangeSelectedStatus}
                      className={`h-8 rounded-lg px-3 text-xs font-semibold ${
                        selectedTicket.estado === estado
                          ? "bg-gray-900 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      }`}
                    >
                      {estado.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <form onSubmit={agregarComentario} className="space-y-2 border-t border-gray-100 pt-4">
                  <textarea
                    value={commentForm.comentario}
                    onChange={(event) => setCommentForm((prev) => ({ ...prev, comentario: event.target.value }))}
                    required
                    rows={3}
                    placeholder="Agregar comentario..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      Agregar otro archivo
                      <input
                        type="file"
                        name="soportes[]"
                        multiple
                        onChange={(event) =>
                          setCommentForm((prev) => ({
                            ...prev,
                            soportes: appendSelectedFiles(prev.soportes, event.target.files),
                          }))
                        }
                        className="sr-only"
                      />
                    </label>
                    <input
                      type="url"
                      value={commentForm.link}
                      onChange={(event) => setCommentForm((prev) => ({ ...prev, link: event.target.value }))}
                      placeholder="Link opcional"
                      className="h-9 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={commentForm.cerrar}
                        disabled={!canChangeSelectedStatus || selectedTicket.estado === "cerrado"}
                        onChange={(event) => setCommentForm((prev) => ({ ...prev, cerrar: event.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      Cerrar
                    </label>
                    <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                      Comentar
                    </button>
                  </div>
                  {commentForm.soportes.length > 0 && (
                    <p className="text-[11px] text-gray-500">
                      {commentForm.soportes.length} archivo(s): {selectedFileNames(commentForm.soportes)}
                    </p>
                  )}
                </form>

                <div className="space-y-2">
                  {selectedTicket.historial?.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-700">{item.usuario?.name ?? "Usuario"}</p>
                        <p className="text-[11px] text-gray-400">{fmtDateTime(item.created_at)}</p>
                      </div>
                      <p className="text-sm text-gray-600">{item.comentario}</p>
                      {filePaths(item.soporte, item.soportes).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                          {filePaths(item.soporte, item.soportes).map((path, index) => (
                            <a
                              key={`${path}-${index}`}
                              href={fileUrl(path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Soporte {index + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-3 mt-2 inline-flex items-center gap-1 text-xs text-blue-600">
                          <LinkIcon className="h-3.5 w-3.5" />
                          Link
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {pagination && pagination.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{pagination.from}-{pagination.to} de {pagination.total}</span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={pagination.current_page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: pagination.current_page - 1 }))}
                className="rounded border border-gray-300 p-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setFilters((prev) => ({ ...prev, page: pagination.current_page + 1 }))}
                className="rounded border border-gray-300 p-1.5 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreate} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Nuevo ticket TIC</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Departamento</label>
                <Select
                  value={selectedDepartamento}
                  onChange={(option) => updateForm("departamento_id", option?.value ?? "")}
                  options={departamentoOptions}
                  placeholder="Seleccionar departamento..."
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
                {fieldErrors.departamento_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.departamento_id[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Usuario asignado</label>
                <Select
                  value={selectedUsuario}
                  onChange={(option) => updateForm("user_asignado_id", option?.value ?? "")}
                  options={usuarioOptions}
                  placeholder={form.departamento_id ? "Seleccionar usuario..." : "Selecciona primero un departamento"}
                  isDisabled={!form.departamento_id}
                  isLoading={isUsuariosLoading}
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                  noOptionsMessage={() =>
                    form.departamento_id ? "No hay usuarios en este departamento" : "Selecciona primero un departamento"
                  }
                />
                {fieldErrors.user_asignado_id && <p className="mt-1 text-xs text-red-500">{fieldErrors.user_asignado_id[0]}</p>}
                {form.departamento_id && !isUsuariosLoading && usuarios.length === 0 && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No hay usuarios en este departamento.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Mi equipo asignado</label>
                <Select
                  value={selectedAsignacion}
                  onChange={(option) => updateForm("asignacion_id", option?.value ?? "")}
                  options={asignacionOptions}
                  placeholder={user?.id ? "Seleccionar equipo..." : "Cargando usuario..."}
                  isDisabled={!user?.id}
                  isLoading={isAsignacionesLoading}
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => (user?.id ? "No tienes equipos activos asignados" : "Cargando usuario...")}
                />
                {user?.id && !isAsignacionesLoading && asignacionesUsuario.length === 0 && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No tienes equipos activos asignados.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Prioridad</label>
                <select
                  value={form.prioridad}
                  onChange={(event) => updateForm("prioridad", event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Fecha de entrega</label>
                <input
                  type="date"
                  value={form.fecha_entrega}
                  onChange={(event) => updateForm("fecha_entrega", event.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                />
                {fieldErrors.fecha_entrega && <p className="mt-1 text-xs text-red-500">{fieldErrors.fecha_entrega[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Hora de entrega</label>
                <input
                  type="time"
                  value={form.hora_entrega}
                  onChange={(event) => updateForm("hora_entrega", event.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                />
                {fieldErrors.hora_entrega && <p className="mt-1 text-xs text-red-500">{fieldErrors.hora_entrega[0]}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(event) => updateForm("descripcion", event.target.value)}
                  required
                  rows={4}
                  placeholder="Describe la solicitud o falla..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {fieldErrors.descripcion && <p className="mt-1 text-xs text-red-500">{fieldErrors.descripcion[0]}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">Soportes</label>
                <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Agregar otro archivo
                  <input
                    type="file"
                    name="archivos[]"
                    multiple
                    onChange={(event) => updateForm("archivos", appendSelectedFiles(form.archivos, event.target.files))}
                    className="sr-only"
                  />
                </label>
                {form.archivos.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {form.archivos.length} archivo(s): {selectedFileNames(form.archivos)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={editarTicket} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Editar ticket TIC</h2>
              <button type="button" onClick={cancelarEdicion} className="rounded p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Departamento</label>
                <Select
                  value={selectedEditDepartamento}
                  onChange={(option) => updateEditForm("departamento_id", option?.value ?? "")}
                  options={departamentoOptions}
                  placeholder="Seleccionar departamento..."
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
                {editFieldErrors.departamento_id && <p className="mt-1 text-xs text-red-500">{editFieldErrors.departamento_id[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Usuario asignado</label>
                <Select
                  value={selectedEditUsuario}
                  onChange={(option) => updateEditForm("user_asignado_id", option?.value ?? "")}
                  options={usuarioOptions}
                  placeholder={editForm.departamento_id ? "Seleccionar usuario..." : "Selecciona primero un departamento"}
                  isDisabled={!editForm.departamento_id}
                  isLoading={isUsuariosLoading}
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                  noOptionsMessage={() =>
                    editForm.departamento_id ? "No hay usuarios en este departamento" : "Selecciona primero un departamento"
                  }
                />
                {editFieldErrors.user_asignado_id && <p className="mt-1 text-xs text-red-500">{editFieldErrors.user_asignado_id[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Equipo asignado</label>
                <Select
                  value={selectedEditAsignacion}
                  onChange={(option) => updateEditForm("asignacion_id", option?.value ?? "")}
                  options={asignacionOptions}
                  placeholder={editForm.user_asignado_id ? "Seleccionar equipo..." : "Selecciona primero un usuario"}
                  isDisabled={!editForm.user_asignado_id}
                  isLoading={isAsignacionesLoading}
                  isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => (editForm.user_asignado_id ? "No tiene equipos activos" : "Selecciona primero un usuario")}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Prioridad</label>
                <select
                  value={editForm.prioridad}
                  onChange={(event) => updateEditForm("prioridad", event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Fecha de entrega</label>
                <input
                  type="date"
                  value={editForm.fecha_entrega}
                  onChange={(event) => updateEditForm("fecha_entrega", event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                />
                {editFieldErrors.fecha_entrega && <p className="mt-1 text-xs text-red-500">{editFieldErrors.fecha_entrega[0]}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Hora de entrega</label>
                <input
                  type="time"
                  value={editForm.hora_entrega}
                  onChange={(event) => updateEditForm("hora_entrega", event.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                />
                {editFieldErrors.hora_entrega && <p className="mt-1 text-xs text-red-500">{editFieldErrors.hora_entrega[0]}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">Descripción</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(event) => updateEditForm("descripcion", event.target.value)}
                  required
                  rows={4}
                  placeholder="Describe la solicitud o falla..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {editFieldErrors.descripcion && <p className="mt-1 text-xs text-red-500">{editFieldErrors.descripcion[0]}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">Soportes</label>
                <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Agregar otro archivo
                  <input
                    type="file"
                    name="archivos[]"
                    multiple
                    onChange={(event) => updateEditForm("archivos", appendSelectedFiles(editForm.archivos, event.target.files))}
                    className="sr-only"
                  />
                </label>
                {editForm.archivos.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {editForm.archivos.length} archivo(s): {selectedFileNames(editForm.archivos)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button type="button" onClick={cancelarEdicion} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
