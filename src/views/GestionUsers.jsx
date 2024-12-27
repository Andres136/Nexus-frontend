import React, { useState } from 'react'
import Modal from '../components/calidad/Modal';
import RegisterUsers from '../components/RegisterUsers';
import RegisterDepartaments from '../components/calidad/RegisterDepartaments';
import TableUsers from '../components/TableUsers';
import useSystem from '../hooks/useSystem';

export default function GestionUsers() {
    const { darkMode, toggleDarkMode}= useSystem()
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isDepartmentModalOpen, setDepartmentModalOpen] = useState(false);
  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white p-6" : "min-h-screen bg-gray-100 text-gray-900 p-6"}>
 

    {/* Layout Principal */}
    <div className="flex">
      {/* Sidebar */}
     
      {/* Contenido Principal */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Gestion de Usuarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-32 gap-6">
          {/* Bloque 1: Registrar Usuarios */}
          <div className={darkMode ? "bg-gray-800 p-6 rounded-lg shadow-md" : "bg-white p-6 rounded-lg shadow-md"}>
            <h3 className="text-lg font-bold mb-4">Registrar Usuarios</h3>
            <p className="mb-4">Gestiona el registro de nuevos usuarios en el sistema.</p>
            <button onClick={() => setUserModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Registrar Usuario
            </button>
            <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
              <RegisterUsers />
            </Modal>
          </div>
        
          {/* Bloque 2: Registrar Departamentos */}
          <div className={darkMode ? "bg-gray-800 p-6 rounded-lg shadow-md" : "bg-white p-6 rounded-lg shadow-md"}>
            <h3 className="text-lg font-bold mb-4">Registrar Departamentos</h3>
            <p className="mb-4">Agrega y gestiona los departamentos de la organización.</p>
            <button onClick={() => setDepartmentModalOpen(true)} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Registrar Departamento
            </button>
            <Modal isOpen={isDepartmentModalOpen} onClose={() => setDepartmentModalOpen(false)}>
              <RegisterDepartaments />
            </Modal>
          </div>
        </div>
      </main>
    </div>
    <div className='grid grid-cols-1 gap-6'>
      <TableUsers />
    </div>
  </div>
  )
}
