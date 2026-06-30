/* eslint-disable react/prop-types */
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import clienteAxios from "../../config/axios";
import { useAuth } from "../../hooks/useAuth";
import ModalCarpeta from "../../components/crm/ModalCarpeta";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Folder, FolderOpen, FolderPlus, Search, FileText,
  ChevronRight, Loader2, X, Plus, Trash2, Home,
} from "lucide-react";

// ─── helpers API ──────────────────────────────────────────────────────────────
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

async function apiFetchCarpetas(parentId, search, page = 1) {
  const params = {
    ...(search ? { search } : (parentId != null ? { parent_id: parentId } : {})),
    page,
  };
  const { data } = await clienteAxios.get("/api/carpetas", { headers: authHeaders(), params });
  return data;
}

async function apiCrearCarpeta({ nombre, parentId }) {
  const { data } = await clienteAxios.post(
    "/api/carpetas",
    { nombre, parent_id: parentId ?? null },
    { headers: authHeaders() }
  );
  return data;
}

async function apiEliminarCarpeta(id) {
  const { data } = await clienteAxios.delete(`/api/carpetas/${id}`, { headers: authHeaders() });
  return data;
}

async function apiMoverCarpeta({ id, parentId }) {
  const { data } = await clienteAxios.put(
    `/api/carpetas/${id}/mover`,
    { parent_id: parentId },
    { headers: authHeaders() }
  );
  return data;
}

// ─── TarjetaCarpeta ───────────────────────────────────────────────────────────
function TarjetaCarpeta({ carpeta, onNavegar, onAbrirDocs, onEliminar, esAdmin, isDragging }) {
  const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
    id: carpeta.id,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: carpeta.id });

  const setRef = useCallback(
    (node) => { setDragRef(node); setDropRef(node); },
    [setDragRef, setDropRef]
  );

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setRef}
      style={style}
      className={`relative group bg-white rounded-xl border-2 p-4 transition-all select-none
        ${isOver && !isDragging
          ? "border-blue-500 bg-blue-50 scale-[1.03] shadow-lg"
          : "border-gray-200 hover:border-blue-300 hover:shadow-md"}
        ${isDragging ? "opacity-40" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Eliminar — solo admin */}
      {esAdmin && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEliminar(carpeta); }}
          className="absolute top-2 right-2 p-1 rounded-lg text-gray-300 hover:text-red-500
            hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Eliminar carpeta"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Cuerpo — click navega */}
      <div
        className="flex flex-col items-center gap-2 cursor-pointer"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onNavegar(carpeta)}
      >
        <div className={`p-3 rounded-xl transition-colors ${isOver ? "bg-blue-200" : "bg-blue-50 group-hover:bg-blue-100"}`}>
          <Folder className={`w-8 h-8 ${isOver ? "text-blue-700" : "text-blue-500"}`} />
        </div>
        <p className="text-sm font-medium text-gray-800 text-center line-clamp-2 w-full leading-snug">
          {carpeta.nombre}
        </p>
        <div className="flex gap-3 text-[11px] text-gray-400 flex-wrap justify-center">
          {carpeta.subcarpetas_count > 0 && (
            <span>{carpeta.subcarpetas_count} subcarpeta{carpeta.subcarpetas_count !== 1 ? "s" : ""}</span>
          )}
          <span>{carpeta.documentos_count ?? 0} doc{(carpeta.documentos_count ?? 0) !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Ver archivos */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onAbrirDocs(carpeta); }}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg
          text-[11px] font-medium text-gray-400 hover:text-blue-600 hover:bg-blue-50
          border border-transparent hover:border-blue-100 transition-all"
        title="Ver documentos"
      >
        <FileText className="w-3 h-3" /> Ver archivos
      </button>
    </div>
  );
}

// ─── ModalNuevaCarpeta ────────────────────────────────────────────────────────
function ModalNuevaCarpeta({ parentId, parentNombre, onClose, onCrear, isCreando }) {
  const [nombre, setNombre] = useState("");

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FolderPlus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {parentId ? "Nueva subcarpeta" : "Nueva carpeta"}
              </h2>
              {parentId && (
                <p className="text-xs text-gray-400">dentro de {parentNombre}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); if (nombre.trim()) onCrear(nombre.trim()); }}
          className="p-5 space-y-4"
        >
          <input
            autoFocus
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Nombre de la carpeta..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-sm font-medium"
            >
              {isCreando
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Plus className="w-4 h-4" />}
              {isCreando ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function RegistroDocumentacion() {
  const { user } = useAuth({ middleware: "auth" });
  const esAdmin = user?.role_id === 1;

  const [path, setPath]                   = useState([]); // [{id, nombre}]
  const [searchTerm, setSearchTerm]       = useState("");
  const [page, setPage]                   = useState(1);
  const [modalNueva, setModalNueva]       = useState(false);
  const [carpetaDetalle, setCarpetaDetalle] = useState(null);
  const [activeDragId, setActiveDragId]   = useState(null);

  const queryClient = useQueryClient();
  const currentFolderId   = path.length > 0 ? path[path.length - 1].id    : null;
  const currentFolderNombre = path.length > 0 ? path[path.length - 1].nombre : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["carpetas", currentFolderId, searchTerm, page],
    queryFn: () => apiFetchCarpetas(currentFolderId, searchTerm, page),
    placeholderData: (prev) => prev,
  });

  const carpetas      = data?.data ?? [];
  const pagination     = data?.current_page ? data : null;
  const carpetaActiva = carpetas.find((c) => c.id === activeDragId);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const mutCrear = useMutation({
    mutationFn: apiCrearCarpeta,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["carpetas"] });
      setModalNueva(false);
    },
    onError: (err) => {
      const msgs = err.response?.data?.errors;
      if (msgs) Object.values(msgs).flat().forEach((m) => toast.error(m));
      else toast.error("Error al crear la carpeta");
    },
  });

  const mutEliminar = useMutation({
    mutationFn: apiEliminarCarpeta,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["carpetas"] });
    },
    onError: () => toast.error("Error al eliminar la carpeta"),
  });

  const mutMover = useMutation({
    mutationFn: apiMoverCarpeta,
    onSuccess: () => {
      toast.success("Carpeta movida correctamente");
      queryClient.invalidateQueries({ queryKey: ["carpetas"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? "No se pudo mover la carpeta");
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const navegar = (carpeta) => {
    if (searchTerm) setSearchTerm("");
    setPage(1);
    setPath((prev) => [...prev, { id: carpeta.id, nombre: carpeta.nombre }]);
  };

  const navegarBreadcrumb = (index) => {
    setPage(1);
    setPath(index === -1 ? [] : (prev) => prev.slice(0, index + 1));
  };

  const handleEliminar = (carpeta) => {
    Swal.fire({
      title: `¿Eliminar "${carpeta.nombre}"?`,
      text: "Se eliminará la carpeta, sus subcarpetas y todos sus documentos. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) mutEliminar.mutate(carpeta.id);
    });
  };

  const handleDragStart = ({ active }) => setActiveDragId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    mutMover.mutate({ id: active.id, parentId: over.id });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Gestión de Carpetas</h2>
              <p className="text-xs text-gray-400">Organiza y administra tu documentación</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            {/* Buscador */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar carpetas..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPath([]); setPage(1); }}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

           
              <button
                onClick={() => setModalNueva(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                  text-white text-sm font-medium transition-colors shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                {currentFolderId ? "Nueva subcarpeta" : "Nueva carpeta"}
              </button>
            
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {(path.length > 0 || searchTerm) && (
        <div className="flex items-center gap-1.5 px-1 flex-wrap text-xs">
          <button
            onClick={() => { navegarBreadcrumb(-1); setSearchTerm(""); setPage(1); }}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Raíz
          </button>
          {path.map((item, i) => (
            <span key={item.id} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <button
                onClick={() => navegarBreadcrumb(i)}
                className={`transition-colors ${
                  i === path.length - 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                {item.nombre}
              </button>
            </span>
          ))}
          {searchTerm && (
            <span className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-500">&quot;{searchTerm}&quot;</span>
            </span>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-72">

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
          </div>
        )}

        {!isLoading && carpetas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Folder className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-400">
              {searchTerm
                ? `Sin resultados para "${searchTerm}"`
                : currentFolderId
                  ? "Esta carpeta está vacía"
                  : "No hay carpetas aún"}
            </p>
            {esAdmin && !searchTerm && (
              <button
                onClick={() => setModalNueva(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600
                  hover:bg-blue-700 text-white text-sm font-medium mt-1"
              >
                <FolderPlus className="w-4 h-4" />
                {currentFolderId ? "Crear subcarpeta" : "Crear primera carpeta"}
              </button>
            )}
          </div>
        )}

        {!isLoading && carpetas.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              {searchTerm
                ? `${pagination?.total ?? carpetas.length} resultado${(pagination?.total ?? carpetas.length) !== 1 ? "s" : ""}`
                : `${pagination?.total ?? carpetas.length} carpeta${(pagination?.total ?? carpetas.length) !== 1 ? "s" : ""}`}
              {!searchTerm && (
                <span className="ml-2 font-normal text-gray-300 normal-case">
                  · arrastra una carpeta sobre otra para moverla
                </span>
              )}
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {carpetas.map((carpeta) => (
                  <TarjetaCarpeta
                    key={carpeta.id}
                    carpeta={carpeta}
                    onNavegar={navegar}
                    onAbrirDocs={setCarpetaDetalle}
                    onEliminar={handleEliminar}
                    esAdmin={esAdmin}
                    isDragging={activeDragId === carpeta.id}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={null}>
                {carpetaActiva ? (
                  <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-2xl w-28 rotate-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Folder className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-gray-800 text-center line-clamp-2">
                        {carpetaActiva.nombre}
                      </p>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            {pagination && pagination.last_page > 1 && (
              <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Mostrando {pagination.from ?? 0}-{pagination.to ?? 0} de {pagination.total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={pagination.current_page <= 1 || isLoading}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-gray-500">
                    Página {pagination.current_page} de {pagination.last_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(pagination.last_page, current + 1))}
                    disabled={pagination.current_page >= pagination.last_page || isLoading}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal nueva carpeta / subcarpeta */}
      {modalNueva && (
        <ModalNuevaCarpeta
          parentId={currentFolderId}
          parentNombre={currentFolderNombre}
          onClose={() => setModalNueva(false)}
          onCrear={(nombre) => mutCrear.mutate({ nombre, parentId: currentFolderId })}
          isCreando={mutCrear.isPending}
        />
      )}

      {/* Modal documentos de la carpeta */}
      {carpetaDetalle && (
        <ModalCarpeta
          carpeta={carpetaDetalle}
          esAdmin={esAdmin}
          onClose={() => setCarpetaDetalle(null)}
        />
      )}
    </div>
  );
}
