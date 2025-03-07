import { useState } from 'react'
import Modal from '../components/calidad/Modal';
import RegisterUsers from '../components/RegisterUsers';
import RegisterDepartaments from '../components/calidad/RegisterDepartaments';
import TableUsers from '../components/TableUsers';
import useSystem from '../hooks/useSystem';
import { Link } from 'react-router-dom';


export default function GestionUsers() {
    const { darkMode, toggleDarkMode}= useSystem()
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isDepartmentModalOpen, setDepartmentModalOpen] = useState(false);
 
  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white p-6" : "min-h-screen bg-gray-100 text-gray-900 p-6"}>
      {/* Layout Principal */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
       
        {/* Contenido Principal */}
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">Gestion de Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Bloque 1: Registrar Usuarios */}
            <div className={darkMode ? "bg-gray-800 p-6 rounded-lg shadow-md" : "bg-white p-6 rounded-lg shadow-md"}>
              <h3 className="text-lg font-bold mb-4">Registrar Usuarios</h3>
              <p className="mb-4">Gestiona el registro de nuevos usuarios en el sistema.</p>
              <button onClick={() => setUserModalOpen(true)} className=" bg-gray-700 text-white px-4 py-2 rounded hover:bg-green-700">
                Registrar Usuario
              </button>
              <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
                <RegisterUsers onClose={() => setUserModalOpen(false)} />
              </Modal>
            </div>
          
            {/* Bloque 2: Registrar Departamentos */}
            <div className={darkMode ? "bg-gray-800 p-6 rounded-lg shadow-md" : "bg-white p-6 rounded-lg shadow-md"}>
              <h3 className="text-lg font-bold mb-4">Registrar Departamentos</h3>
              <p className="mb-4">Agrega y gestiona los departamentos de la organización.</p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <button onClick={() => setDepartmentModalOpen(true)} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-green-700">
                  Registrar Departamento
                </button>
                <Link to="/admin/departamentos" className="bg-gray-700 text-white px-4 py-2 text-center rounded hover:bg-green-700">
                  Actualizar Departamento
                </Link>
              </div>
              <Modal isOpen={isDepartmentModalOpen} onClose={() => setDepartmentModalOpen(false)}>
                <RegisterDepartaments onClose={() => setDepartmentModalOpen(false)} />
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
