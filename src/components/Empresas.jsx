import { useState, useEffect } from "react";
import { useEmpresas } from "../hooks/Useempresas";
import { FaEdit, FaTrash, FaPlus, FaBuilding } from "react-icons/fa";
import Modal from "../components/calidad/Modal";
import axios from "axios";
import clienteAxios from "../config/axios";

export default function Empresas() {
  const {
    empresas,
    error,
    loading,
    registrarEmpresa,
    updateEmpresa,
    deleteEmpresa,
  } = useEmpresas();

  const [showModal, setShowModal] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    nit: "",
    logo: "",
  });

  const openModal = (empresa = null) => {
    if (empresa) {
      setSelectedEmpresa(empresa);
      setFormData({
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        nit: empresa.nit,
        logo: empresa.logo || "",
      });
    } else {
      setSelectedEmpresa(null);
      setFormData({
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        nit: "",
        logo: null,
      });
    }
    setShowModal(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData();
  data.append("nombre", formData.nombre);
  data.append("direccion", formData.direccion);
  data.append("telefono", formData.telefono);
  data.append("email", formData.email);
  data.append("nit", formData.nit);
if (formData.logo instanceof File) {
  data.append("logo", formData.logo);
}

  if (selectedEmpresa) {
    await updateEmpresa(selectedEmpresa.id, data);
  } else {
    await registrarEmpresa(data);
  }

  setShowModal(false);
};


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <FaBuilding className="text-blue-600" /> Empresas
        </h2>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => openModal()}
        >
          <FaPlus /> Registrar Empresa
        </button>
      </div>

      {/* Estados */}
      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando empresas...</p>
        </div>
      )}


      {!loading && empresas?.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No hay empresas registradas aún.</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && empresas?.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="py-3 px-4 border-b">Nombre</th>
                <th className="py-3 px-4 border-b">Dirección</th>
                <th className="py-3 px-4 border-b">Teléfono</th>
                <th className="py-3 px-4 border-b">Email</th>
                <th className="py-3 px-4 border-b">NIT</th>
                <th className="py-3 px-4 border-b">Logo</th>
                <th className="py-3 px-4 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa, index) => (
                <tr
                  key={empresa.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="py-3 px-4 border-b">{empresa.nombre}</td>
                  <td className="py-3 px-4 border-b">{empresa.direccion}</td>
                  <td className="py-3 px-4 border-b">{empresa.telefono}</td>
                  <td className="py-3 px-4 border-b">{empresa.email}</td>
                  <td className="py-3 px-4 border-b">{empresa.nit}</td>
                  <td className="py-3 px-4 border-b text-center">
                    {empresa.logo ? (
                     <img
  src={
    empresa.logo
      ? `${clienteAxios.defaults.baseURL}/storage/${empresa.logo}`
      : ""
  }
  alt={`${empresa.nombre} Logo`}
  className="h-10 w-10 object-contain mx-auto"
/>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                        Sin Logo
                      </span>
                    )}
                  </td>
                <td className="py-3 px-4 border-b text-center">
  <div className="flex flex-wrap gap-2 justify-center items-center">
    <button
      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition flex items-center gap-1"
      onClick={() => openModal(empresa)}
    >
      <FaEdit /> Editar
    </button>
    <button
      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
      onClick={() => deleteEmpresa(empresa.id)}
    >
      <FaTrash /> Eliminar
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal reutilizable */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3 className="text-xl font-bold mb-4">
          {selectedEmpresa ? "Editar Empresa" : "Registrar Empresa"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
              <div> <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        
                className={`w-full border rounded px-3 py-2 ${error && error.nombre ? "border-red-500" : ""}`}
              />
              {error?.nombre && (
  <p className="text-red-500 text-xs mt-1">{error.nombre[0]}</p>
)}
              
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Dirección"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className={`w-full border rounded px-3 py-2 ${error && error.direccion ? "border-red-500" : ""}`}
                />
                {error?.direccion && (
                  <p className="text-red-500 text-xs mt-1">{error.direccion[0]}</p>
                )}
              </div>
        
         <div>
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className={`w-full border rounded px-3 py-2 ${error && error.telefono ? "border-red-500" : ""}`}
          />

          {error?.telefono && (
  <p className="text-red-500 text-xs mt-1">{error.telefono[0]}</p>
)}
        </div>
        <input
          type="email"
          placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="NIT"
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            className={`w-full border rounded px-3 py-2 ${error && error.nit ? "border-red-500" : ""}`}
          />
          {error?.nit && (
  <p className="text-red-500 text-xs mt-1">{error.nit[0]}</p>
)}
          <input
  type="file"
  onChange={(e) => setFormData({ ...formData, logo: e.target.files[0] })} // guarda el archivo
  className={`w-full border rounded px-3 py-2 ${error && error.logo ? "border-red-500" : ""}`}
/>
{error?.logo && <p className="text-red-500 text-xs mt-1">{error.logo[0]}</p>}


          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {selectedEmpresa ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


