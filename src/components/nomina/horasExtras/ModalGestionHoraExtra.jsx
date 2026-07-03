import { useState } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";

export default function ModalGestionHoraExtra({ item, accion, onClose, onConfirm, loading }) {
  const [observacion, setObservacion] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {accion === "aprobar" ? "Aprobar hora extra" : "Rechazar hora extra"}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Empleado: <span className="font-medium text-gray-700">{item?.empleado?.name ?? "-"}</span>
          {" · "}{item?.horas}h
        </p>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Observación <span className="text-gray-400">(opcional)</span>
        </label>
        <textarea
          rows={3}
          value={observacion}
          onChange={(event) => setObservacion(event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Escribe una observación..."
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(observacion)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md disabled:opacity-60 ${
              accion === "aprobar" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {accion === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo"}
          </button>
        </div>
      </div>
    </div>
  );
}

ModalGestionHoraExtra.propTypes = {
  item: PropTypes.object,
  accion: PropTypes.oneOf(["aprobar", "rechazar"]).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
