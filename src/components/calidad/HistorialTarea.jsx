import { useState } from "react";
import PropTypes from "prop-types";
import { History, MessageSquarePlus, Loader2, ArrowRight } from "lucide-react";
import { useHistorialTarea } from "../../hooks/calidad/useHistorialTarea";

const ESTADOS = { 1: "Pendiente", 2: "Completada", 5: "En Curso" };

const TIPO_BADGE = {
  cambio_estado: "bg-blue-100 text-blue-700",
  nota: "bg-purple-100 text-purple-700",
};

export function HistorialTarea({ tareaId, canAddNote, enabled }) {
  const { historial, isLoading, agregarNota, agregando } = useHistorialTarea(tareaId, enabled);
  const [nota, setNota] = useState("");
  const [mostrarInput, setMostrarInput] = useState(false);

  const enviarNota = async () => {
    if (!nota.trim()) return;
    await agregarNota(nota.trim());
    setNota("");
    setMostrarInput(false);
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
        <History size={12} /> Historial
      </h5>

      {isLoading ? (
        <p className="text-xs text-gray-400">Cargando...</p>
      ) : historial.length === 0 ? (
        <p className="text-xs text-gray-400">Sin actividad aún.</p>
      ) : (
        <ul className="space-y-2">
          {historial.map((entry) => (
            <li key={entry.id} className="flex gap-2 text-xs">
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <div className="w-px flex-1 bg-gray-100" />
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${TIPO_BADGE[entry.tipo]}`}>
                    {entry.tipo === "cambio_estado" ? "Estado" : "Nota"}
                  </span>
                  {entry.tipo === "cambio_estado" && (
                    <span className="flex items-center gap-1 text-gray-500">
                      {ESTADOS[entry.estado_anterior] ?? entry.estado_anterior}
                      <ArrowRight size={10} />
                      {ESTADOS[entry.estado_nuevo] ?? entry.estado_nuevo}
                    </span>
                  )}
                  <span className="text-gray-400 ml-auto shrink-0">{entry.fecha}</span>
                </div>
                {entry.nota && (
                  <p className="mt-0.5 text-gray-600 italic">&ldquo;{entry.nota}&rdquo;</p>
                )}
                <span className="text-gray-400">{entry.usuario}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canAddNote && (
        <div className="mt-2">
          {mostrarInput ? (
            <div className="space-y-1.5">
              <textarea
                rows={2}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe una nota de seguimiento..."
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={enviarNota}
                  disabled={agregando || !nota.trim()}
                  className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {agregando && <Loader2 size={11} className="animate-spin" />}
                  Guardar
                </button>
                <button
                  onClick={() => { setMostrarInput(false); setNota(""); }}
                  className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setMostrarInput(true)}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1"
            >
              <MessageSquarePlus size={12} /> Agregar nota
            </button>
          )}
        </div>
      )}
    </div>
  );
}

HistorialTarea.propTypes = {
  tareaId: PropTypes.number.isRequired,
  canAddNote: PropTypes.bool,
  enabled: PropTypes.bool,
};
