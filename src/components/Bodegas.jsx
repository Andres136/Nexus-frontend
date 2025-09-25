import { useState } from "react"
import { useSedes } from "../hooks/useSedes"
import Modal from "./calidad/Modal"
import { Plus, Edit, Trash2 } from "lucide-react"
import Select from "react-select"

export default function Bodegas() {
  const { bodegas, registrarBodega, eliminarBodega, updateBodega, errorBodegas, sedes } = useSedes()
  const [showModal, setShowModal] = useState(false)
  const [selectedBodega, setSelectedBodega] = useState(null)
  const [formData, setFormData] = useState({ nombre: "", sede_id: null, direccion: "" })

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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Bodegas</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center space-x-2"
          onClick={() => openModal()}
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Bodega</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left font-semibold">Sede</th>
              <th className="px-6 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bodegas.map((bodega) => (
              <tr key={bodega.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{bodega.nombre}</td>
                <td className="px-6 py-4">
                  {sedes.find((s) => s.id === bodega.sede_id)?.nombre || "—"}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    className="inline-flex items-center bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                    onClick={() => openModal(bodega)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </button>
                  <button
                    className="inline-flex items-center bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    onClick={() => eliminarBodega(bodega.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {bodegas.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  No hay bodegas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
          {selectedBodega ? "Editar Bodega" : "Registrar Nueva Bodega"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${
                errorBodegas?.nombre ? "border-red-500" : ""
              }`}
            />
            {errorBodegas?.nombre && (
              <p className="text-red-500 text-xs mt-1">{errorBodegas.nombre[0]}</p>
            )}
          </div>


          <div>
            <label className="block text-gray-700 font-medium">Direccion</label> 
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${
                errorBodegas?.direccion ? "border-red-500" : ""
              }`}
            />
            {errorBodegas?.direccion && (
              <p className="text-red-500 text-xs mt-1">{errorBodegas.direccion[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Sede</label>
            <Select
              options={sedes.map((sede) => ({ value: sede.id, label: sede.nombre }))}
              value={formData.sede_id}
              onChange={(selected) => setFormData({ ...formData, sede_id: selected })}
              classNamePrefix="react-select"
            />
            {errorBodegas?.sede_id && (
              <p className="text-red-500 text-xs mt-1">{errorBodegas.sede_id[0]}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {selectedBodega ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
