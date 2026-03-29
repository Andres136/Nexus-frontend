import { useEffect, useState } from "react";
import { useGetTipoResiduos } from "../../hooks/hseq/useGetTipoResiduos";
import { useGetTipoResiduosById } from "../../hooks/hseq/useGetTipoResiduosById";
import { useRegisterTipoResiduos } from "../../hooks/hseq/useRegisterTipoResiduos";

export default function TipoResiduos() {
  const [selectedResiduoId, setSelectedResiduoId] = useState(null);
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
  } = useRegisterTipoResiduos();

  const {
    data: tipoResiduos,
    isLoading: loadingTipoResiduos,
    error: errorTipoResiduos,
  } = useGetTipoResiduos();

  const { data: residuoById } = useGetTipoResiduosById(selectedResiduoId);

  // Efecto para cargar datos en el form y abrir el modal al editar
  useEffect(() => {
    if (residuoById && selectedResiduoId) {
      setFormData({
        id: residuoById.id, // Aseguramos que el ID esté en el formData para el handleUpdate
        nombre: residuoById.nombre || "",
        descripcion: residuoById.descripcion || "",
      });
      setIsModalOpen(true);
    }
  }, [residuoById, selectedResiduoId, setFormData]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResiduoId(null);
    setFormData({ nombre: "", descripcion: "" }); // Reset manual si es necesario
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.id || selectedResiduoId) {
      await handleUpdate(e, formData.id || selectedResiduoId);
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
        {/* ENCABEZADO */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Residuos</h1>
            <p className="text-gray-600">Configura las categorías y tipos de residuos permitidos.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span> Nuevo Residuo
          </button>
        </header>

        {/* LISTADO EN GRID */}
        {loadingTipoResiduos ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600"></div>
          </div>
        ) : errorTipoResiduos ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700">
            Ocurrió un error al cargar los tipos de residuos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tipoResiduos?.map((residuo) => (
              <div key={residuo.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 capitalize">{residuo.nombre}</h3>
                  <hr className="mt-2 w-10 border-emerald-500 border-2 rounded" />
                </div>
                <p className="text-gray-600 text-sm mb-6 flex-grow">
                  {residuo.descripcion || "Sin descripción disponible."}
                </p>
                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => setSelectedResiduoId(residuo.id)}
                    className="flex-1 bg-amber-50 text-amber-600 py-2 rounded-lg hover:bg-amber-100 transition-colors font-semibold text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(residuo.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (Fondo oscuro) */}
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          
          {/* Contenido del Modal */}
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedResiduoId ? "Actualizar Residuo" : "Nuevo Tipo de Residuo"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-3xl transition-colors">&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Residuo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Plásticos, Peligrosos..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  required
                />
                {error?.nombre && <p className="text-red-500 text-xs mt-2 ml-1">⚠ {error.nombre[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Detallada</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Escribe aquí los detalles del residuo..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
                {error?.descripcion && <p className="text-red-500 text-xs mt-2 ml-1">⚠ {error.descripcion[0]}</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="order-2 sm:order-1 flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`order-1 sm:order-2 flex-1 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-md ${
                    selectedResiduoId ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                  } ${loading ? "opacity-50 cursor-wait" : ""}`}
                >
                  {loading ? "Procesando..." : selectedResiduoId ? "Guardar Cambios" : "Crear Ahora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}