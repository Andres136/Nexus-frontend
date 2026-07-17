import { useState } from "react";
import PropTypes from "prop-types";
import { Loader2, X } from "lucide-react";

const ESTADOS = ["ACTIVA", "PAUSADA", "COMPLETADA", "CANCELADA", "BLOQUEADA"];

export default function ModalCorregirActividad({ actividad, onClose, onConfirm, loading }) {
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [campos, setCampos] = useState({
    estado: actividad?.estado ?? "",
    segundos: actividad?.segundos ?? "",
    titulo: actividad?.titulo ?? "",
    descripcion: actividad?.descripcion ?? "",
    resultado: actividad?.resultado ?? "",
    motivo_bloqueo: actividad?.motivo_bloqueo ?? "",
  });

  const actualizarCampo = (campo, valor) => setCampos((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivo.trim()) return;

    const datosNuevos = {};
    Object.entries(campos).forEach(([campo, valor]) => {
      const original = actividad?.[campo] ?? "";
      if (String(valor) !== String(original) && valor !== "") {
        datosNuevos[campo] = campo === "segundos" ? Number(valor) : valor;
      }
    });

    onConfirm({ motivo: motivo.trim(), observaciones: observaciones.trim() || undefined, datos_nuevos: datosNuevos });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl p-6">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-800">Corregir actividad</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {actividad?.titulo || actividad?.tipo} · {actividad?.usuarioNombre}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Motivo de la corrección <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              minLength={5}
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="¿Por qué se corrige esta actividad?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select
                value={campos.estado}
                onChange={(e) => actualizarCampo("estado", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Segundos</label>
              <input
                type="number"
                min="0"
                value={campos.segundos}
                onChange={(e) => actualizarCampo("segundos", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
            <input
              type="text"
              value={campos.titulo}
              onChange={(e) => actualizarCampo("titulo", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={campos.descripcion}
              onChange={(e) => actualizarCampo("descripcion", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Resultado</label>
            <textarea
              rows={2}
              value={campos.resultado}
              onChange={(e) => actualizarCampo("resultado", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo de bloqueo</label>
            <textarea
              rows={2}
              value={campos.motivo_bloqueo}
              onChange={(e) => actualizarCampo("motivo_bloqueo", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Observaciones <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || motivo.trim().length < 5}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Guardar corrección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ModalCorregirActividad.propTypes = {
  actividad: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
