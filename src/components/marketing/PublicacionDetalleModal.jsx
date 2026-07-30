import PropTypes from "prop-types";
import { Link2, Copy, Check, ExternalLink, Trash2 } from "lucide-react";

export default function PublicacionDetalleModal({
  publicacion,
  linkInput,
  setLinkInput,
  descripcionInput,
  setDescripcionInput,
  copiado,
  guardandoLink,
  guardandoDescripcion,
  onCopiarLink,
  onGuardarLink,
  onGuardarDescripcion,
  onCambiarEstado,
  onEliminar,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-[420px] max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold mb-1 text-lg">{publicacion.fullData?.titulo}</h2>
        <p className="text-sm text-gray-500 mb-4">📅 {publicacion.start}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            {publicacion.red}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            {publicacion.tipo}
          </span>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Descripción
          </label>
          <textarea
            value={descripcionInput}
            onChange={(e) => setDescripcionInput(e.target.value)}
            placeholder="Copy, notas o referencias del post"
            className="w-full border p-2 rounded text-sm"
            rows={3}
          />
          {descripcionInput !== (publicacion.descripcion || "") && (
            <button
              type="button"
              onClick={onGuardarDescripcion}
              disabled={guardandoDescripcion}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
            >
              {guardandoDescripcion ? "Guardando..." : "Guardar descripción"}
            </button>
          )}
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5" /> Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://..."
              className="w-full border p-2 rounded text-sm"
            />
            <button
              type="button"
              onClick={() => onCopiarLink(linkInput)}
              disabled={!linkInput}
              className="shrink-0 px-3 border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copiar link"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            {linkInput ? (
              <a
                href={linkInput}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 border rounded hover:bg-gray-50 flex items-center justify-center"
                title="Abrir link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span
                className="shrink-0 px-3 border rounded flex items-center justify-center opacity-40 cursor-not-allowed"
                title="Agrega un link para poder abrirlo"
              >
                <ExternalLink className="w-4 h-4" />
              </span>
            )}
          </div>
          {linkInput !== (publicacion.link || "") && (
            <button
              type="button"
              onClick={onGuardarLink}
              disabled={guardandoLink}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
            >
              {guardandoLink ? "Guardando..." : "Guardar link"}
            </button>
          )}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select
          value={publicacion.estado}
          onChange={(e) => onCambiarEstado(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="programado">Programado</option>
          <option value="publicado">Publicado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <button
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded mb-2"
          onClick={onEliminar}
        >
          <Trash2 className="w-4 h-4" /> Eliminar publicación
        </button>

        <button
          className="w-full border py-2 rounded"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

PublicacionDetalleModal.propTypes = {
  publicacion: PropTypes.object.isRequired,
  linkInput: PropTypes.string.isRequired,
  setLinkInput: PropTypes.func.isRequired,
  descripcionInput: PropTypes.string.isRequired,
  setDescripcionInput: PropTypes.func.isRequired,
  copiado: PropTypes.bool,
  guardandoLink: PropTypes.bool,
  guardandoDescripcion: PropTypes.bool,
  onCopiarLink: PropTypes.func.isRequired,
  onGuardarLink: PropTypes.func.isRequired,
  onGuardarDescripcion: PropTypes.func.isRequired,
  onCambiarEstado: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
