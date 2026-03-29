import { useEffect, useState } from "react";
import { useGetTipoServicioById } from "../../hooks/hseq/useGetTipoServicioById";
import { useGetTipoServicios } from "../../hooks/hseq/useGetTipoServicios";
import { useRegisterTipoServicios } from "../../hooks/hseq/useRegisterTipoServicios";

export default function TipoServicios() {
  const [selectedTipoServicioId, setSelectedTipoServicioId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const {
    setFormData,
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    handleUpdate,
    handleDelete,
  } = useRegisterTipoServicios();

  const { data, isLoading, error: errorTipoServicios } = useGetTipoServicios();
  const { data: tipoServicioSelected } = useGetTipoServicioById(selectedTipoServicioId);

  // Cargar datos en el form y abrir modal al editar
  useEffect(() => {
    if (tipoServicioSelected && selectedTipoServicioId) {
      setFormData({
        nombre: tipoServicioSelected.nombre || "",
        descripcion: tipoServicioSelected.descripcion || "",
        unidad_medida: tipoServicioSelected.unidad_medida || "",
      });
      setIsModalOpen(true);
    }
  }, [tipoServicioSelected, selectedTipoServicioId, setFormData]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTipoServicioId(null);
    setFormData({ nombre: "", descripcion: "", unidad_medida: "" });
  };

  const handleFormSubmit = async (e) => {
    if (selectedTipoServicioId) {
      await handleUpdate(e, selectedTipoServicioId);
    } else {
      await handleSubmit(e);
    }
    if (!error || (typeof error === "object" && Object.keys(error).length === 0)) {
      closeModal();
    }

  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Tipos de Servicios</h1>
            <p className="text-gray-600">Gestiona el catálogo de servicios de la plataforma</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Nuevo Servicio
          </button>
        </header>

        {/* LISTADO */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : errorTipoServicios ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error al cargar los datos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((tipo) => (
              <div key={tipo.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{tipo.nombre}</h3>
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded">
                    {tipo.unidad_medida}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3">{tipo.descripcion}</p>
                <div className="flex gap-2 border-t pt-4">
                  <button
                    onClick={() => setSelectedTipoServicioId(tipo.id)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(tipo.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedTipoServicioId ? "Editar Servicio" : "Nuevo Servicio"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Consultoría HSEQ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
                {error?.nombre && <p className="text-red-500 text-xs mt-1">{error.nombre[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                {error?.descripcion && <p className="text-red-500 text-xs mt-1">{error.descripcion[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                <input
                  type="text"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  placeholder="Ej. Horas, Sesiones"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                {error?.unidad_medida && <p className="text-red-500 text-xs mt-1">{error.unidad_medida[0]}</p>}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all ${
                    selectedTipoServicioId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Guardando..." : selectedTipoServicioId ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}