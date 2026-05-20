import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, useDroppable, useDraggable,
} from "@dnd-kit/core";
import {
  Calendar, User, Edit3, X, Save, Clock, PlayCircle,
  AlertCircle, Search, Loader2, GripVertical, CheckCircle2,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { BsListTask } from "react-icons/bs";
import { SoportesTarea } from "./SoportesTarea";
import { HistorialTarea } from "../../components/calidad/HistorialTarea";
import { tareaService } from "../../services/calidaService";

// ─── helpers ─────────────────────────────────────────────────────────────────

const puedesCerrar = (tarea, user) =>
  [1, 20].includes(user?.role_id) || user?.id === tarea.user_id_creo;

const esVencida = (tarea) => {
  const fl = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
  return fl && fl < new Date() && tarea.estado_id === 1;
};

const fmtFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
    : "";

// ─── DragHandle ───────────────────────────────────────────────────────────────

function DragHandle({ listeners, attributes }) {
  return (
    <div
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors touch-none shrink-0"
    >
      <GripVertical size={15} />
    </div>
  );
}
DragHandle.propTypes = { listeners: PropTypes.object, attributes: PropTypes.object };

// ─── TareaCard ────────────────────────────────────────────────────────────────

function TareaCard({ tarea, user, borderAccent, expandido, onToggleExpand, onEdit, onIniciarCierre }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(tarea.id),
    data: { tarea },
  });

  const vencida = esVencida(tarea);
  const acento = vencida ? "border-l-red-500" : borderAccent;
  const puede = puedesCerrar(tarea, user);

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl border-l-4 ${acento} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden select-none ${isDragging ? "opacity-30 scale-[0.98]" : ""}`}
    >
      {/* Header */}
      <div className="p-3 flex items-start gap-1.5">
        <DragHandle listeners={listeners} attributes={attributes} />

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggleExpand(tarea.id)}>
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-gray-800 text-sm truncate flex-1">{tarea.nombre}</h4>

            {user?.role_id === 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(tarea); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
              >
                <Edit3 size={13} />
              </button>
            )}

            {expandido
              ? <ChevronUp size={14} className="text-gray-400 shrink-0" />
              : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <User size={11} className="text-gray-400" />
              {tarea.usuario?.name || "Sin asignar"}
            </span>
            {tarea.fecha_fin && (
              <span className={`flex items-center gap-1 text-xs ${vencida ? "text-red-500 font-medium" : "text-gray-500"}`}>
                <Calendar size={11} />
                {fmtFecha(tarea.fecha_fin)}
              </span>
            )}
            {tarea.departamentos?.nombre && (
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-medium">
                {tarea.departamentos.nombre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandido */}
      <div className={`overflow-hidden transition-all duration-300 ${expandido ? "max-h-[600px]" : "max-h-0"}`}>
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {tarea.descripcion || "Sin descripción"}
          </p>

          <SoportesTarea tareaId={tarea.id} />

          <HistorialTarea
            tareaId={tarea.id}
            enabled={expandido}
            canAddNote={puede || user?.id === tarea.user_id}
          />

          {tarea.estado_id === 5 && (
            <div className="mt-4">
              {puede ? (
                <button
                  onClick={() => onIniciarCierre(tarea)}
                  className="w-full py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg transition-all"
                >
                  Marcar Completada
                </button>
              ) : (
                <p className="text-xs text-center text-gray-400 py-2">
                  Solo el responsable puede cerrar esta tarea
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

TareaCard.propTypes = {
  tarea: PropTypes.object.isRequired,
  user: PropTypes.object,
  borderAccent: PropTypes.string,
  expandido: PropTypes.bool,
  onToggleExpand: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onIniciarCierre: PropTypes.func.isRequired,
};

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({ col, isOver, user, expandidos, onToggleExpand, onEdit, onIniciarCierre }) {
  const { setNodeRef } = useDroppable({ id: col.id });
  const Icon = col.icon;

  return (
    <div className="flex flex-col min-w-[260px]">
      {/* Header */}
      <div className={`bg-gradient-to-r ${col.gradient} rounded-t-2xl p-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon size={18} className="text-white" />
            </div>
            <h3 className="font-bold text-white">{col.titulo}</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-white/20 text-white">
            {col.tareas.length}
          </span>
        </div>
      </div>

      {/* Drop area */}
      <div
        ref={setNodeRef}
        className={`
          ${col.bgCard} rounded-b-2xl p-3
          min-h-[240px] max-h-[calc(100vh-300px)]
          overflow-y-auto space-y-3
          border border-t-0 border-gray-200/50
          transition-all duration-150
          ${isOver ? `ring-2 ring-inset ${col.ringColor} brightness-[0.97]` : ""}
        `}
      >
        {col.tareas.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-10 gap-2 transition-colors ${isOver ? "text-gray-600" : "text-gray-400"}`}>
            <Icon size={36} strokeWidth={1.2} className={`${isOver ? "opacity-70" : "opacity-30"}`} />
            <p className="text-sm">{isOver && col.dropHint ? col.dropHint : col.emptyLabel}</p>
          </div>
        ) : (
          <>
            {col.tareas.map((t) => (
              <TareaCard
                key={t.id}
                tarea={t}
                user={user}
                borderAccent={col.borderAccent}
                expandido={expandidos.has(t.id)}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onIniciarCierre={onIniciarCierre}
              />
            ))}

            {/* Drop hint at bottom when hovering with a card */}
            {isOver && col.dropHint && (
              <div className={`border-2 border-dashed rounded-xl p-3 text-center text-sm font-medium transition-colors ${col.dropHintStyle}`}>
                {col.dropHint}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

KanbanColumn.propTypes = {
  col: PropTypes.object.isRequired,
  isOver: PropTypes.bool,
  user: PropTypes.object,
  expandidos: PropTypes.instanceOf(Set),
  onToggleExpand: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onIniciarCierre: PropTypes.func.isRequired,
};

// ─── GhostCard (drag overlay) ─────────────────────────────────────────────────

function GhostCard({ tarea }) {
  return (
    <div className="bg-white rounded-xl border-l-4 border-indigo-500 shadow-2xl p-3 w-64 rotate-1 opacity-95">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-gray-400 shrink-0" />
        <p className="text-sm font-semibold text-gray-800 truncate">{tarea.nombre}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1 ml-5 truncate">{tarea.usuario?.name}</p>
    </div>
  );
}
GhostCard.propTypes = { tarea: PropTypes.object.isRequired };

// ─── ModalCierre ─────────────────────────────────────────────────────────────

function ModalCierre({ tarea, onConfirm, onCancel }) {
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    await onConfirm(tarea, nota);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-white" />
            <h3 className="text-lg font-bold text-white">Cerrar tarea</h3>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            ¿Confirmas que <span className="font-semibold text-gray-800">{tarea.nombre}</span> fue completada?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota de cierre <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="¿Qué se hizo para completarla?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? "Cerrando..." : "Confirmar cierre"}
          </button>
        </div>
      </div>
    </div>
  );
}

ModalCierre.propTypes = {
  tarea: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// ─── Tareas (main) ────────────────────────────────────────────────────────────

export default function Tareas() {
  const { user } = useAuth({ middleware: "auth" });

  const [tareas, setTareas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [actualizar, setActualizar] = useState(false);
  const [expandidos, setExpandidos] = useState(new Set());

  const [editModal, setEditModal] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", fecha_fin: "" });
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  const [pendingClose, setPendingClose] = useState(null);

  const [activeDragId, setActiveDragId] = useState(null);
  const [overColumnId, setOverColumnId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── data ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = busqueda.trim() ? { usuario: busqueda.trim() } : {};
        const res = await tareaService.getTareas(params);
        setTareas(res.data);
      } catch {
        setTareas([]);
      }
    };
    fetch();
  }, [actualizar, busqueda]);

  const refresh = () => setActualizar((p) => !p);

  const tareasMap = useMemo(
    () => Object.fromEntries(tareas.map((t) => [String(t.id), t])),
    [tareas]
  );

  const grupos = useMemo(() => {
    const r = { vencidas: [], pendientes: [], en_curso: [] };
    tareas.forEach((t) => {
      if (esVencida(t)) r.vencidas.push(t);
      else if (t.estado_id === 1) r.pendientes.push(t);
      else if (t.estado_id === 5) r.en_curso.push(t);
    });
    return r;
  }, [tareas]);

  // ── expand ───────────────────────────────────────────────────────────────────

  const toggleExpand = (id) =>
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── edit ─────────────────────────────────────────────────────────────────────

  const abrirEdicion = (tarea) => {
    setTareaEditando(tarea);
    setFormData({
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      fecha_fin: tarea.fecha_fin?.split("T")[0] || "",
    });
    setEditModal(true);
  };

  const guardarEdicion = async () => {
    try {
      setCargandoEdicion(true);
      await tareaService.actualizarTarea(tareaEditando.id, formData);
      toast.success("Tarea actualizada");
      setEditModal(false);
      refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setCargandoEdicion(false);
    }
  };

  // ── close ────────────────────────────────────────────────────────────────────

  const handleConfirmarCierre = async (tarea, nota) => {
    try {
      await tareaService.avanzarEstado(tarea.id, { nota: nota || null });
      toast.success("Tarea completada");
      setPendingClose(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Error al cerrar la tarea");
    }
  };

  // ── dnd ──────────────────────────────────────────────────────────────────────

  const onDragStart = ({ active }) => setActiveDragId(active.id);
  const onDragOver = ({ over }) => setOverColumnId(over?.id ?? null);

  const onDragEnd = async ({ active, over }) => {
    setActiveDragId(null);
    setOverColumnId(null);
    if (!over) return;

    const tarea = tareasMap[active.id];
    if (!tarea) return;

    const dest = over.id;

    if (tarea.estado_id === 1 && dest === "en_curso") {
      try {
        await tareaService.avanzarEstado(tarea.id, {});
        toast.success("Tarea iniciada");
        refresh();
      } catch {
        toast.error("Error al iniciar la tarea");
      }
      return;
    }

    if (tarea.estado_id === 5 && dest === "completadas") {
      if (!puedesCerrar(tarea, user)) {
        toast.error("Solo el usuario que registró la tarea puede cerrarla");
        return;
      }
      setPendingClose(tarea);
      return;
    }
  };

  // ── column config ─────────────────────────────────────────────────────────────

  const columnas = [
    {
      id: "vencidas",
      titulo: "Vencidas",
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      bgCard: "bg-red-50/60",
      borderAccent: "border-l-red-500",
      ringColor: "ring-red-400",
      emptyLabel: "Sin tareas vencidas",
      tareas: grupos.vencidas,
    },
    {
      id: "pendientes",
      titulo: "Pendientes",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgCard: "bg-amber-50/60",
      borderAccent: "border-l-amber-500",
      ringColor: "ring-amber-400",
      emptyLabel: "Sin tareas pendientes",
      tareas: grupos.pendientes,
    },
    {
      id: "en_curso",
      titulo: "En Curso",
      icon: PlayCircle,
      gradient: "from-blue-500 to-indigo-600",
      bgCard: "bg-blue-50/60",
      borderAccent: "border-l-blue-500",
      ringColor: "ring-blue-400",
      dropHint: "Soltar para iniciar",
      dropHintStyle: "border-blue-400 text-blue-600",
      emptyLabel: "Sin tareas en curso",
      tareas: grupos.en_curso,
    },
    {
      id: "completadas",
      titulo: "Completar",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      bgCard: "bg-emerald-50/60",
      borderAccent: "border-l-emerald-500",
      ringColor: "ring-emerald-400",
      dropHint: "Soltar para completar",
      dropHintStyle: "border-emerald-400 text-emerald-600",
      emptyLabel: "Arrastra aquí para completar",
      tareas: [],
    },
  ];

  const activeTarea = activeDragId ? tareasMap[activeDragId] : null;

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <BsListTask size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-800">Gestión de Tareas</h1>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  {tareas.length} activas · arrastra las tarjetas para cambiar estado
                </p>
              </div>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-5 min-w-max xl:grid xl:grid-cols-4 xl:min-w-0">
            {columnas.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                isOver={overColumnId === col.id}
                user={user}
                expandidos={expandidos}
                onToggleExpand={toggleExpand}
                onEdit={abrirEdicion}
                onIniciarCierre={setPendingClose}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
          {activeTarea ? <GhostCard tarea={activeTarea} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modal cierre */}
      {pendingClose && (
        <ModalCierre
          tarea={pendingClose}
          onConfirm={handleConfirmarCierre}
          onCancel={() => setPendingClose(null)}
        />
      )}

      {/* Modal edición */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Editar Tarea</h3>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input type="text" value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea rows={4} value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha límite</label>
                <input type="date" value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setEditModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={cargandoEdicion}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {cargandoEdicion ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {cargandoEdicion ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
