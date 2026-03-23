import { useRegistroTipoInspecciones } from "../../hooks/hseq/useRegistroTipoInspecciones"
import { useGetTipoInspecciones } from "../../hooks/hseq/useGetTipoInspecciones";
import { useEffect, useState } from "react";
import { useGetTipoInspeccionesById } from "../../hooks/hseq/useGetipoInspeccionesById";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import NexusLoader from "../NexusLoader";

export default function RegistroTipoInspecciones() {
  const { form, errors, loading, handleChange, handleSubmit, setForm, eliminarTipoInspeccion } = useRegistroTipoInspecciones();
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, error } = useGetTipoInspecciones();
  const { data: tipoEditando } = useGetTipoInspeccionesById(editId, {
    enabled: !!editId,
  });

  useEffect(() => {
    if (tipoEditando) {
      setForm({
        id: tipoEditando.id,
        nombre: tipoEditando.nombre,
      });
    }
  }, [tipoEditando]);

  const abrirModalCrear = () => {
    setEditId(null);
    setForm({ nombre: "" });
    setModalOpen(true);
  };

  const abrirModalEditar = (id) => {
    setEditId(id);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm({ nombre: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    cerrarModal();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Inspecciones</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona los tipos de inspecciones del sistema</p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tipo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-gray-500"><NexusLoader text="Cargando tipo de inspecciones ..." />  </div>
        )}    
        {error && (
          <div className="p-8 text-center text-red-500">Error al cargar los tipos de inspecciones</div>
        )}
        {!isLoading && !error && (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No hay tipos de inspecciones registrados
                  </td>
                </tr>
              )}
              {data?.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{tipo.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tipo.nombre}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(tipo.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminarTipoInspeccion(tipo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editId ? "Editar Tipo de Inspección" : "Nuevo Tipo de Inspección"}
              </h2>
              <button
                onClick={cerrarModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={onSubmit} className="p-6">
              <div className="mb-6">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Tipo de Inspección
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre..."
                  className={`w-full px-3 py-2 border ${
                    errors.nombre ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                    editId
                      ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                      : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                  }`}
                >
                  {loading ? "Guardando..." : editId ? "Actualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}