import { useState } from "react";
import { useSedes } from "../hooks/useSedes";
import Modal from "../components/calidad/Modal";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Building, MapPin, Warehouse, BarChart3 } from "lucide-react";

export default function Sedes() {
  const { sedes, registrarSede, updateSede, eliminarSede, error } = useSedes();
  const [showModal, setShowModal] = useState(false);
  const [selectedSede, setSelectedSede] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", direccion: "" });
  // Función para redirigir a la vista de Bodegas
  const navigate = useNavigate();

  const openModal = (sede = null) => {
    if (sede) {
      setSelectedSede(sede);
      setFormData({ nombre: sede.nombre, direccion: sede.direccion });
    } else {
      setSelectedSede(null);
      setFormData({ nombre: "", direccion: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSede) {
      await updateSede(selectedSede.id, formData);
    } else {
      await registrarSede(formData);
    }
    setShowModal(false);
  };

  const irABodegas = () => {
    navigate("/admin/bodegas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Sedes</h1>
                <p className="text-gray-600 mt-1">Administra las sedes de tu organización</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-3 transform hover:scale-105"
                onClick={() => openModal()}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nueva Sede</span>
              </button>
              
              <button
                onClick={irABodegas}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-3 transform hover:scale-105"
                title="Ir a Gestión de Bodegas"
              >
                <Warehouse className="w-5 h-5" />
                <span className="font-medium">Bodegas</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Total Sedes</p>
                  <p className="text-2xl font-bold text-blue-900">{sedes.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">Sedes Activas</p>
                  <p className="text-2xl font-bold text-green-900">{sedes.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-800 text-sm font-medium">Cobertura</p>
                  <p className="text-2xl font-bold text-purple-900">100%</p>
                </div>
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla mejorada */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Building className="w-5 h-5 text-gray-700" />
              <span>Lista de Sedes</span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Información de la Sede
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sedes.map((sede, index) => (
                  <tr key={sede.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{sede.nombre}</div>
                          <div className="text-sm text-gray-500">Sede corporativa</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{sede.direccion}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center space-x-3">
                        <button
                          className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={() => openModal(sede)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          <span className="font-medium">Editar</span>
                        </button>
                        <button
                          className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={() => eliminarSede(sede.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span className="font-medium">Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sedes.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Building className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">No hay sedes registradas</h3>
                          <p className="text-gray-500 mt-1">Comienza creando tu primera sede</p>
                        </div>
                        <button
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => openModal()}
                        >
                          Crear Sede
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal mejorado */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-2xl border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSede ? "Editar Sede" : "Registrar Nueva Sede"}
              </h2>
            </div>
            <p className="text-gray-600 mt-2">
              {selectedSede ? "Modifica la información de la sede" : "Complete los datos para crear una nueva sede"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-2">
                  Nombre de la Sede *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                    error && error.nombre ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                  placeholder="Ej: Sede Principal, Sucursal Norte..."
                />
                {error?.nombre && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full inline-block mr-2"></span>
                    {error.nombre[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 border-gray-200 bg-white"
                  placeholder="Ej: Calle 123 #45-67, Ciudad..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {selectedSede ? "Actualizar Sede" : "Crear Sede"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}