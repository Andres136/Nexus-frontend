import { useState } from "react"
import { useSedes } from "../hooks/useSedes"
import Modal from "./calidad/Modal"
import { Plus, Edit, Trash2, Building2, MapPin, Archive } from "lucide-react"
import Select from "react-select"

export default function Bodegas() {
  const { bodegas, registrarBodega, eliminarBodega, updateBodega, errorBodegas, sedes } = useSedes()
  const [showModal, setShowModal] = useState(false)
  const [selectedBodega, setSelectedBodega] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", sede_id: null, direccion: "" })
console.log("Bodegas cargadas:", bodegas);
  const openModal = (bodega = null) => {
    if (bodega) {
      setSelectedBodega(bodega)
      setFormData({

        nombre: bodega.nombre,
        direccion: bodega.direccion,
        sede_id: sedes.find((s) => s.id === bodega.sede_id)
          ? { value: bodega.sede_id, label: sedes.find((s) => s.id === bodega.sede_id).nombre }
          : null,
      })
    } else {
      setSelectedBodega(null)
      setFormData({ nombre: "", sede_id: null })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const dataToSend = {
      nombre: formData.nombre,
        direccion: formData.direccion,
      sede_id: formData.sede_id?.value || "",
    }
    if (selectedBodega) {
      await updateBodega(selectedBodega.id, dataToSend)
    } else {
      await registrarBodega(dataToSend)
    }
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Bodegas</h1>
                <p className="text-gray-600 mt-1">Administra las bodegas de tu organización</p>
              </div>
            </div>
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-3 transform hover:scale-105"
              onClick={() => openModal()}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nueva Bodega</span>
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 text-sm font-medium">Total Bodegas</p>
                  <p className="text-2xl font-bold text-blue-900">{bodegas.length}</p>
                </div>
                <Archive className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 text-sm font-medium">Sedes Activas</p>
                  <p className="text-2xl font-bold text-green-900">{sedes.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-800 text-sm font-medium">Operativas</p>
                  <p className="text-2xl font-bold text-purple-900">{bodegas.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla mejorada */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Archive className="w-5 h-5 text-gray-700" />
              <span>Lista de Bodegas</span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Información de la Bodega
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
                {bodegas.map((bodega, index) => (
                  <tr key={bodega.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{bodega.nombre}</div>
                          {bodega.direccion && (
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {bodega.direccion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900 font-medium">
                          {sedes.find((s) => s.id === bodega.sede_id)?.nombre || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center space-x-3">
                        <button
                          className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={() => openModal(bodega)}
                        >
                          <Edit className="w-4 h-4 mr-2" /> 
                          <span className="font-medium">Editar</span>
                        </button>
                        <button
                          className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          onClick={() => eliminarBodega(bodega.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> 
                          <span className="font-medium">Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bodegas.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Archive className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">No hay bodegas registradas</h3>
                          <p className="text-gray-500 mt-1">Comienza creando tu primera bodega</p>
                        </div>
                        <button
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => openModal()}
                        >
                          Crear Bodega
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
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedBodega ? "Editar Bodega" : "Registrar Nueva Bodega"}
              </h2>
            </div>
            <p className="text-gray-600 mt-2">
              {selectedBodega ? "Modifica la información de la bodega" : "Complete los datos para crear una nueva bodega"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-800 font-semibold text-sm mb-2">
                  Nombre de la Bodega *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                    errorBodegas?.nombre ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                  placeholder="Ej: Bodega Principal, Almacén Norte..."
                />
                {errorBodegas?.nombre && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full inline-block mr-2"></span>
                    {errorBodegas.nombre[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-800 font-semibold text-sm mb-2">
                  Dirección
                </label> 
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 ${
                    errorBodegas?.direccion ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                  placeholder="Ej: Calle 123 #45-67, Ciudad..."
                />
                {errorBodegas?.direccion && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full inline-block mr-2"></span>
                    {errorBodegas.direccion[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-800 font-semibold text-sm mb-2">
                  Sede *
                </label>
                <Select
                  options={sedes.map((sede) => ({ value: sede.id, label: sede.nombre }))}
                  value={formData.sede_id}
                  onChange={(selected) => setFormData({ ...formData, sede_id: selected })}
                  classNamePrefix="react-select"
                  placeholder="Selecciona una sede..."
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: `2px solid ${errorBodegas?.sede_id ? '#f87171' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      padding: '0.25rem',
                      boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                      '&:hover': {
                        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
                      color: state.isSelected ? 'white' : '#1f2937'
                    })
                  }}
                />
                {errorBodegas?.sede_id && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded-full inline-block mr-2"></span>
                    {errorBodegas.sede_id[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {selectedBodega ? "Actualizar Bodega" : "Crear Bodega"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}