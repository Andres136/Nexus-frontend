import PropTypes from "prop-types";
import { useRef } from "react";
import { Paperclip, Upload, X, FileText, Loader2 } from "lucide-react";
import { useGetSoporteHallazgoById } from "../../hooks/calidad/useGetSoporteHallazgoById";
import { useRegisterSoporteTarea } from "../../hooks/calidad/useRegisterSoporteTarea";

const BASE_URL = import.meta.env.VITE_API_URL;

const formatFecha = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

SoportesHallazgo.propTypes = {
  hallazgoId: PropTypes.number.isRequired,
};

export function SoportesHallazgo({ hallazgoId }) {
  const fileInputRef = useRef(null);

  const { data: soportesExistentes, isLoading } = useGetSoporteHallazgoById(hallazgoId);
  const { soportes, loading, error, handleFilesChange, removeFile, handleSubmitSoportes } =
    useRegisterSoporteTarea({ id: hallazgoId, tipo: "hallazgo" });

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
        <Paperclip size={13} /> Soportes de Cierre
      </h4>

      {/* Archivos ya subidos */}
      {isLoading ? (
        <p className="text-xs text-slate-400 mb-3">Cargando soportes...</p>
      ) : soportesExistentes?.length > 0 ? (
        <ul className="mb-3 space-y-1">
          {soportesExistentes.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-xs text-slate-600">
              <FileText size={13} className="text-blue-500 shrink-0" />
              {s.soporte_tarea ? (
                <a
                  href={`${BASE_URL}/storage/${s.soporte_tarea}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 truncate max-w-xs"
                >
                  {s.soporte_tarea.split("/").pop()}
                </a>
              ) : (
                <span className="text-slate-400 italic">Sin archivo</span>
              )}
              <span className="text-slate-300 shrink-0 ml-auto">{formatFecha(s.created_at)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400 mb-3">Sin soportes de cierre.</p>
      )}

      {/* Selección de archivos nuevos */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Paperclip size={13} /> Adjuntar archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFilesChange(e.target.files)}
        />

        {soportes.length > 0 && (
          <button
            type="button"
            onClick={handleSubmitSoportes}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {loading ? "Subiendo..." : `Subir (${soportes.length})`}
          </button>
        )}
      </div>

      {/* Errores de validación */}
      {error && (
        <ul className="mt-2 space-y-0.5">
          {Object.values(error).flat().map((msg, i) => (
            <li key={i} className="text-xs text-red-500 font-medium">{msg}</li>
          ))}
        </ul>
      )}

      {/* Lista de archivos pendientes */}
      {soportes.length > 0 && (
        <ul className="mt-2 space-y-1">
          {soportes.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <FileText size={12} className="shrink-0" />
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-red-400 hover:text-red-600 ml-auto"
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
