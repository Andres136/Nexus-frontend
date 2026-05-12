import PropTypes from "prop-types";
import { useRef } from "react";
import { Paperclip, Upload, X, FileText, Loader2 } from "lucide-react";
import { useGetSoporteTareaById } from "../../hooks/calidad/useGetSoporteTareaById";
import { useRegisterSoporteTarea } from "../../hooks/calidad/useRegisterSoporteTarea";

const BASE_URL = import.meta.env.VITE_API_URL;

const formatFecha = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

SoportesTarea.propTypes = {
  tareaId: PropTypes.number.isRequired,
};

export function SoportesTarea({ tareaId }) {
  const fileInputRef = useRef(null);

  const { data: soportesExistentes, isLoading } = useGetSoporteTareaById(tareaId);
  const { soportes, loading, error, handleFilesChange, removeFile, handleSubmitSoportes } =
    useRegisterSoporteTarea({ id: tareaId, tipo: "tarea" });

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
        <Paperclip size={12} /> Soportes
      </h5>

      {/* Archivos ya subidos */}
      {isLoading ? (
        <p className="text-xs text-gray-400 mb-2">Cargando...</p>
      ) : soportesExistentes?.length > 0 ? (
        <ul className="mb-2 space-y-1.5">
          {soportesExistentes.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-xs text-gray-500">
              <FileText size={12} className="text-blue-400 shrink-0" />
              {s.soporte_tarea ? (
                <a
                  href={`${BASE_URL}/storage/${s.soporte_tarea}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-500 truncate max-w-[160px]"
                >
                  {s.soporte_tarea.split("/").pop()}
                </a>
              ) : (
                <span className="text-gray-400 italic">Sin archivo</span>
              )}
              <span className="text-gray-300 shrink-0 ml-auto">{formatFecha(s.created_at)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400 mb-2">Sin soportes.</p>
      )}

      {/* Botones */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Paperclip size={12} /> Adjuntar
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
            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {loading ? "Subiendo..." : `Subir (${soportes.length})`}
          </button>
        )}
      </div>

      {/* Errores */}
      {error && (
        <ul className="mt-1.5 space-y-0.5">
          {Object.values(error).flat().map((msg, i) => (
            <li key={i} className="text-xs text-red-500">{msg}</li>
          ))}
        </ul>
      )}

      {/* Archivos pendientes */}
      {soportes.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {soportes.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <FileText size={11} className="shrink-0" />
              <span className="truncate max-w-[180px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-red-400 hover:text-red-600 ml-auto"
              >
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
