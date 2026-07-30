import PropTypes from "prop-types";
import { Plus } from "lucide-react";

export default function PublicacionFormModal({
  formData,
  handleChange,
  onSubmit,
  onCancel,
  loading,
  error,
  redesSociales,
  tiposPost,
  onNuevaRedSocial,
  onNuevoTipoPost,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg w-[420px] max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold mb-4 text-lg">Nueva Publicación - {formData.fecha}</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: Lanzamiento nueva línea de producto"
          className="w-full border p-2 mb-3 rounded"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Red social</label>
        <div className="flex gap-2 mb-3">
          <select
            name="red_social_id"
            value={formData.red_social_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Selecciona una red social</option>
            {(redesSociales || []).map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onNuevaRedSocial}
            className="shrink-0 px-3 border rounded hover:bg-gray-50"
            title="Registrar nueva red social"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de post</label>
        <div className="flex gap-2 mb-3">
          <select
            name="tipo_post_id"
            value={formData.tipo_post_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Selecciona un tipo de post</option>
            {(tiposPost || []).map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onNuevoTipoPost}
            className="shrink-0 px-3 border rounded hover:bg-gray-50"
            title="Registrar nuevo tipo de post"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
        <input
          type="url"
          name="link"
          value={formData.link}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full border p-2 mb-3 rounded"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="descripcion"
          placeholder="Copy, notas o referencias del post"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
          rows={3}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        >
          <option value="programado">Programado</option>
          <option value="publicado">Publicado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        {error && (
          <p className="text-red-500 text-sm mb-3">{JSON.stringify(error)}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

PublicacionFormModal.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.object,
  redesSociales: PropTypes.array,
  tiposPost: PropTypes.array,
  onNuevaRedSocial: PropTypes.func.isRequired,
  onNuevoTipoPost: PropTypes.func.isRequired,
};
