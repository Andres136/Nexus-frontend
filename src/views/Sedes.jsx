import { useState,  } from "react";
import { useSedes } from "../hooks/useSedes";
import Modal from "../components/calidad/Modal";

export default function Sedes() {
  const { sedes, registrarSede, updateSede, eliminarSede,error } = useSedes();
  const [showModal, setShowModal] = useState(false);
  const [selectedSede, setSelectedSede] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", direccion: "" });

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

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Sedes</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => openModal()}
        >
          + Registrar Nueva Sede
        </button>
      </div>

      {/* Tabla */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-left">
            <th className="py-3 px-4 border-b">Nombre</th>
            <th className="py-3 px-4 border-b">Dirección</th>
            <th className="py-3 px-4 border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sedes.map((sede) => (
            <tr key={sede.id} className="hover:bg-gray-50 transition">
              <td className="py-2 px-4 border-b">{sede.nombre}</td>
              <td className="py-2 px-4 border-b">{sede.direccion}</td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 mr-2"
                  onClick={() => openModal(sede)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                  onClick={() => eliminarSede(sede.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal con formulario */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-bold mb-4">
          {selectedSede ? "Editar Sede" : "Registrar Nueva Sede"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
       
              className={`w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${error && error.nombre ? "border-red-500" : ""}`}
            />

            {error?.nombre && (
  <p className="text-red-500 text-xs mt-1">{error.nombre[0]}</p>
)}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            
              className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {selectedSede ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
