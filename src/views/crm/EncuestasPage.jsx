import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEncuestaContext } from "../../context/EncuestaContext";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import {
  ClipboardList, Plus, Pencil, Trash2, Send, BarChart2,
  X, Save, Loader2, CheckCircle2, Clock, AlertCircle, Copy, Check,
} from "lucide-react";
import { useEncuestas } from "../../hooks/crm/useEncuestas";
import { useEncuestaEnvios } from "../../hooks/crm/useEncuestaEnvios";
import PreguntaEditor from "../../components/encuestas/PreguntaEditor";
import ListaClientes from "../../components/encuestas/ListaClientes";
import { encuestaService } from "../../services/encuestaService";
import { useQuery } from "@tanstack/react-query";

// ─── helpers ──────────────────────────────────────────────────────────────────
const preguntaVacia = (orden) => ({
  _key: crypto.randomUUID(),
  texto: "",
  tipo: "texto",
  opciones: [],
  orden,
  requerida: true,
});

const ESTADO_CHIP = {
  activa:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactiva: "bg-gray-100  text-gray-500     border-gray-200",
};

// ─── Modal crear / editar ─────────────────────────────────────────────────────
function ModalEncuesta({ encuesta, onClose, onSave, isSaving }) {
  const esEdicion = !!encuesta?.id;
  const [titulo, setTitulo] = useState(encuesta?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(encuesta?.descripcion ?? "");
  const [preguntas, setPreguntas] = useState(
    encuesta?.preguntas?.length
      ? encuesta.preguntas.map((p) => ({ ...p, _key: p.id }))
      : [preguntaVacia(0)]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = preguntas.findIndex((p) => (p._key ?? p.id) === active.id);
    const newIdx = preguntas.findIndex((p) => (p._key ?? p.id) === over.id);
    setPreguntas(arrayMove(preguntas, oldIdx, newIdx).map((p, i) => ({ ...p, orden: i })));
  };

  const addPregunta = () =>
    setPreguntas((prev) => [...prev, preguntaVacia(prev.length)]);

  const changePregunta = useCallback((idx, updated) =>
    setPreguntas((prev) => prev.map((p, i) => (i === idx ? updated : p))), []);

  const removePregunta = (idx) =>
    setPreguntas((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(encuesta?.id ? { id: encuesta.id } : {}),
      data: { titulo, descripcion, preguntas },
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              {esEdicion ? "Editar encuesta" : "Nueva encuesta"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Título y descripción */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                placeholder="Ej. Encuesta de satisfacción del servicio"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Contexto opcional para el cliente"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Preguntas */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Preguntas ({preguntas.length})
            </p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={preguntas.map((p) => p._key ?? p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {preguntas.map((p, idx) => (
                    <PreguntaEditor
                      key={p._key ?? p.id}
                      pregunta={p}
                      index={idx}
                      onChange={changePregunta}
                      onRemove={removePregunta}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              type="button"
              onClick={addPregunta}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Agregar pregunta
            </button>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700
                disabled:bg-gray-200 text-white text-sm font-medium"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Guardando..." : "Guardar encuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal enviar ─────────────────────────────────────────────────────────────
function ModalEnviar({ encuesta, onClose }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [copiados, setCopiados] = useState({});

  const { data: clientes = [] } = useQuery({
    queryKey: ["mis-clientes"],
    queryFn: async () => {
      const res = await encuestaService.getMisClientes();
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { enviar, isEnviando, linksGenerados } = useEncuestaEnvios(encuesta.id);

  const toggleCliente = (id) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const copiarLink = async (link, idx) => {
    await navigator.clipboard.writeText(link);
    setCopiados((prev) => ({ ...prev, [idx]: true }));
    setTimeout(() => setCopiados((prev) => ({ ...prev, [idx]: false })), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Enviar encuesta</h2>
              <p className="text-xs text-gray-400 truncate max-w-xs">{encuesta.titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Links generados */}
          {linksGenerados.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Correos enviados — links generados
              </p>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {linksGenerados.map((l, i) => (
                  <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{l.cliente_nombre}</p>
                      <p className="text-xs text-gray-400 truncate">{l.link}</p>
                    </div>
                    <button
                      onClick={() => copiarLink(l.link, i)}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors
                        ${copiados[i] ? "text-emerald-600 bg-emerald-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                    >
                      {copiados[i] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <ListaClientes
                clientes={clientes}
                seleccionados={seleccionados}
                onToggle={toggleCliente}
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
                  type="button"
                  disabled={seleccionados.length === 0 || isEnviando}
                  onClick={() => enviar(seleccionados)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600
                    hover:bg-blue-700 disabled:bg-gray-200 text-white text-sm font-medium"
                >
                  {isEnviando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    : <><Send className="w-4 h-4" /> Enviar ({seleccionados.length})</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de encuesta ──────────────────────────────────────────────────────
function TarjetaEncuesta({ enc, onEditar, onEnviar, onEliminar, onVerResultados, esAdmin }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{enc.titulo}</h3>
          {enc.descripcion && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{enc.descripcion}</p>
          )}
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium shrink-0 ${ESTADO_CHIP[enc.estado]}`}>
          {enc.estado}
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span><strong className="text-gray-800">{enc.preguntas?.length ?? 0}</strong> preguntas</span>
        <span><strong className="text-gray-800">{enc.envios_count ?? 0}</strong> enviadas</span>
        <span><strong className="text-emerald-700">{enc.envios_respondidas_count ?? 0}</strong> respondidas</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        {esAdmin && (
          <button
            onClick={() => onEditar(enc)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
        )}
        <button
          onClick={() => onEnviar(enc)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Enviar
        </button>
        <button
          onClick={() => onVerResultados(enc)}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-600 hover:bg-violet-50 transition-colors"
        >
          <BarChart2 className="w-3.5 h-3.5" /> Resultados
        </button>
        {esAdmin && (
          <button
            onClick={() => onEliminar(enc.id)}
            className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function EncuestasPage() {
  const navigate = useNavigate();
  const { user } = useAuth({ middleware: "auth" });
  const esAdmin = user?.role_id === 1;
  const { seleccionar } = useEncuestaContext();
  const { encuestas, isLoading, crearEncuesta, actualizarEncuesta, eliminarEncuesta, isCreando, isActualizando } =
    useEncuestas();

  const [modalCrear, setModalCrear]   = useState(false);
  const [editando, setEditando]       = useState(null);
  const [enviando, setEnviando]       = useState(null);

  const irAResultados = (enc) => {
    seleccionar(enc);
    navigate("/auth/crm/encuestas/resultados");
  };

  const handleSave = ({ id, data }) => {
    if (id) {
      actualizarEncuesta({ id, data }, { onSuccess: () => { setEditando(null); setModalCrear(false); } });
    } else {
      crearEncuesta(data, { onSuccess: () => setModalCrear(false) });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Encuestas</h2>
            <p className="text-xs text-gray-400">
              {esAdmin ? "Crea y gestiona encuestas" : "Envía encuestas a tus clientes"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigate("/auth/crm/encuestas/resultados")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-700 text-sm font-medium transition-colors"
          >
            <BarChart2 className="w-4 h-4" /> Resultados
          </button>
          {esAdmin && (
            <button
              onClick={() => { setEditando(null); setModalCrear(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Nueva encuesta
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
        </div>
      )}

      {!isLoading && encuestas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-3">
          <ClipboardList className="w-10 h-10" />
          <p className="text-sm text-gray-400">
            {esAdmin ? "No hay encuestas creadas aún" : "No hay encuestas disponibles para enviar"}
          </p>
          {esAdmin && (
            <button
              onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium mt-2"
            >
              <Plus className="w-4 h-4" /> Crear primera encuesta
            </button>
          )}
        </div>
      )}

      {!isLoading && encuestas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {encuestas.map((enc) => (
            <TarjetaEncuesta
              key={enc.id}
              enc={enc}
              esAdmin={esAdmin}
              onEditar={(e) => { setEditando(e); setModalCrear(true); }}
              onEnviar={setEnviando}
              onEliminar={(id) => eliminarEncuesta(id)}
              onVerResultados={irAResultados}
            />
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      {modalCrear && (
        <ModalEncuesta
          encuesta={editando}
          onClose={() => { setModalCrear(false); setEditando(null); }}
          onSave={handleSave}
          isSaving={isCreando || isActualizando}
        />
      )}

      {/* Modal enviar */}
      {enviando && (
        <ModalEnviar
          encuesta={enviando}
          onClose={() => setEnviando(null)}
        />
      )}
    </div>
  );
}
