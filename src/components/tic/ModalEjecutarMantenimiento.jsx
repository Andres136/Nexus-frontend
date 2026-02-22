import { useState } from "react";
import { useMantenimientoEquiposTic } from "../../hooks/tic/useMantenimientoEquiposTic";

export default function ModalEjecutarMantenimiento({ mantenimiento, onClose, onSuccess }) {

  const [estado, setEstado] = useState(mantenimiento.estado);
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { cambiarEstadoMantenimiento, errorUpdate } = useMantenimientoEquiposTic();
  
  

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("estado", estado);
    formData.append("descripcion", descripcion);

    archivos.forEach((file) => {
      formData.append("archivos[]", file);
    });

    try {
      setLoading(true);
      await cambiarEstadoMantenimiento(mantenimiento.id, formData);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFiles = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    setArchivos([...archivos, ...nuevosArchivos]);
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const getFileName = (path) => {
    return path.split('/').pop();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold mb-4">
          Ejecutar Mantenimiento
        </h2>

        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="completado">Completado</option>
            </select>
            {errorUpdate?.estado && (
              <p className="text-red-500 text-sm mt-1">{errorUpdate.estado[0]}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Evidencias</label>
            <input
              type="file"
              multiple
              onChange={handleAddFiles}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Puedes seleccionar varios archivos a la vez</p>
            
            {archivos.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-semibold">Archivos nuevos ({archivos.length}):</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {archivos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-2 text-red-500 hover:text-red-700 font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mantenimiento.archivos && mantenimiento.archivos.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-semibold">Archivos existentes ({mantenimiento.archivos.length}):</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {mantenimiento.archivos.map((file, index) => (
                    <div key={`existing-${index}`} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline truncate flex-1"
                      >
                        {getFileName(file.archivo)}
                      </a>
                      <span className="text-xs text-gray-500 ml-2">📎</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
}