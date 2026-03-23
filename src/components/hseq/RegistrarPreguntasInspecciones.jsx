import { useGetTipoInspecciones } from "../../hooks/hseq/useGetTipoInspecciones";
import { useRegistrarPreguntasInspecciones } from "../../hooks/hseq/UseRegistrarPreguntasInspecciones";
import Select from "react-select";
import { Plus, Trash2, X, Search, Pencil } from "lucide-react";
import { useGetPreguntasInspeccion } from "../../hooks/hseq/useGetpreguntasInspeccion";
import { useState } from "react";

export default function RegistrarPreguntasInspecciones() {
  const {
    formData,
    setFormData,
    addPregunta,
    updatePregunta,
    removePregunta,
    handleSubmit,
    handleUpdate,
    eliminarPregunta,
    loading,
    errors,
  } = useRegistrarPreguntasInspecciones();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [preguntaEdit, setPreguntaEdit] = useState(null);
  const { data, isLoading } = useGetTipoInspecciones();
  const { dataPreguntas, isLoadingPreguntas,  pagination } =
    useGetPreguntasInspeccion({
      page,
      per_page: 10,
      search,
      tipo_inspeccion_id: formData.tipo_inspeccion_id,
    });

  const getError = (field) => {
    return errors[field]?.[0] || null;
  };

  const getPreguntaError = (index, field) => {
    return errors[`preguntas.${index}.${field}`]?.[0] || null;
  };

  const tiposRespuesta = [
    { value: 1, label: "Sí / No" },
 
  ];

  const getTipoRespuestaLabel = (value) => {
    return tiposRespuesta.find((t) => t.value === value)?.label || value;
  };

  const abrirModal = () => {
    setFormData({ tipo_inspeccion_id: "", preguntas: [] });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setIsEdit(false);
    setPreguntaEdit(null);
    setFormData({ tipo_inspeccion_id: "", preguntas: [] });
  };

 const onSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isEdit) {
      await handleUpdate(preguntaEdit.id, {
  pregunta: formData.preguntas[0].pregunta,
  tipo_respuesta: formData.preguntas[0].tipo_respuesta,
});
    } else {
      await handleSubmit();
    }

    cerrarModal();
  } catch (error) {}
};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preguntas de Inspección</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las preguntas para cada tipo de inspección</p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Pregunta
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pregunta..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo Inspección</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pregunta</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo Respuesta</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoadingPreguntas && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Cargando preguntas...
                  </td>
                </tr>
              )}
              {!isLoadingPreguntas && dataPreguntas?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay preguntas registradas
                  </td>
                </tr>
              )}
              {dataPreguntas?.map((pregunta) => (
                <tr key={pregunta.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{pregunta.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{pregunta.tipo_inspeccion?.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{pregunta.pregunta}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {getTipoRespuestaLabel(pregunta.tipo_respuesta)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{pregunta.orden}</td>
                  <td className="px-6 py-4 text-right">
                <button
  onClick={() => {
    setIsEdit(true);
    setPreguntaEdit(pregunta);

    setFormData({
      tipo_inspeccion_id: pregunta.tipo_inspeccion_id,
      preguntas: [
        {
          pregunta: pregunta.pregunta,
          tipo_respuesta: pregunta.tipo_respuesta,
          orden: pregunta.orden,
          activa: pregunta.activa,
        },
      ],
    });

    setModalOpen(true);
  }}
  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
>
  <Pencil className="w-4 h-4" />
</button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                        onClick={() => eliminarPregunta(pregunta.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            Página {pagination?.currentPage || 1} de {pagination?.lastPage || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination?.currentPage === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={pagination?.currentPage === pagination?.lastPage}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <div>
              <h2 className="text-lg font-semibold text-gray-900">
  {isEdit ? "Editar Pregunta" : "Registrar Preguntas"}
</h2>
                <p className="text-sm text-gray-500">Configura las preguntas para un tipo de inspección</p>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Tipo de Inspección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Inspección
                  </label>
                  <Select
                    options={data?.map((tipo) => ({ value: tipo.id, label: tipo.nombre })) || []}
                    value={data?.map((tipo) => ({ value: tipo.id, label: tipo.nombre })).find(
                      (opt) => opt.value === formData.tipo_inspeccion_id
                    ) || null}
                    onChange={(selected) => setFormData({ ...formData, tipo_inspeccion_id: selected?.value || "" })}
                    isLoading={isLoading}
                    isClearable
                    placeholder="Selecciona un tipo de inspección"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: getError("tipo_inspeccion_id")
                          ? "#ef4444"
                          : state.isFocused ? "#3b82f6" : "#d1d5db",
                        boxShadow: getError("tipo_inspeccion_id")
                          ? "0 0 0 1px #ef4444"
                          : state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
                        "&:hover": { borderColor: getError("tipo_inspeccion_id") ? "#ef4444" : "#3b82f6" },
                      }),
                    }}
                  />
                  {getError("tipo_inspeccion_id") && (
                    <p className="text-red-500 text-sm mt-1">{getError("tipo_inspeccion_id")}</p>
                  )}
                </div>

                {/* Lista de Preguntas */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Preguntas ({formData.preguntas.length})
                    </label>
                    <button
                      type="button"
                      onClick={addPregunta}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>

                  {getError("preguntas") && (
                    <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">{getError("preguntas")}</p>
                  )}

                  {formData.preguntas.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No hay preguntas agregadas</p>
                     {!isEdit &&  <button
                        type="button"
                        onClick={addPregunta}
                        className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        + Agregar primera pregunta
                      </button>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.preguntas.map((pregunta, index) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg ${
                            getPreguntaError(index, "pregunta") || getPreguntaError(index, "tipo_respuesta")
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">
                              Pregunta #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePregunta(index)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Eliminar pregunta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Texto de la pregunta
                              </label>
                              <input
                                type="text"
                                value={pregunta.pregunta}
                                onChange={(e) => updatePregunta(index, "pregunta", e.target.value)}
                                placeholder="Escribe la pregunta..."
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                  getPreguntaError(index, "pregunta")
                                    ? "border-red-500 focus:ring-red-500 bg-white"
                                    : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                                }`}
                              />
                              {getPreguntaError(index, "pregunta") && (
                                <p className="text-red-500 text-sm mt-1">{getPreguntaError(index, "pregunta")}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de respuesta
                              </label>
                              <select
                                value={pregunta.tipo_respuesta}
                                onChange={(e) => updatePregunta(index, "tipo_respuesta", e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                  getPreguntaError(index, "tipo_respuesta")
                                    ? "border-red-500 focus:ring-red-500 bg-white"
                                    : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                                }`}
                              >
                                <option value="">Seleccionar...</option>
                                {tiposRespuesta.map((tipo) => (
                                  <option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </option>
                                ))}
                              </select>
                              {getPreguntaError(index, "tipo_respuesta") && (
                                <p className="text-red-500 text-sm mt-1">{getPreguntaError(index, "tipo_respuesta")}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
          <button
  type="submit"
  disabled={loading || formData.preguntas.length === 0}
  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors"
>
  {loading 
    ? "Guardando..." 
    : isEdit 
      ? "Actualizar Pregunta" 
      : "Guardar Preguntas"}
</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}