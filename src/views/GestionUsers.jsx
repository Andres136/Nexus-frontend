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
    const [refreshKey, setRefreshKey] = useState(0);
 
  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white p-6" : "min-h-screen bg-gray-100 text-gray-900 p-6"}>
      {/* Layout Principal */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
       
        {/* Contenido Principal */}
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">Gestion de Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Bloque 1: Registrar Usuarios */}
  <div className={`p-6 rounded-2xl shadow-md transition-colors ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>


    <h3 className="text-xl font-bold mb-2">👤 Registrar Usuarios</h3>
    <p className="mb-4 text-sm text-gray-400 dark:text-gray-300">Gestiona el registro de nuevos usuarios en el sistema.</p>
    <div className="flex flex-col sm:flex-row gap-4">
       <button
      onClick={() => setUserModalOpen(true)}
      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      + Registrar Usuario
    </button> 

        <Link
        to="/admin/sedes"
        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 text-center rounded-lg transition-colors"
      >
    Sedes
      </Link>


      <Link
        to="/admin/empresas"
        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 text-center rounded-lg transition-colors"
      >
    Empresas
      </Link>
  <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
  <RegisterUsers
    onClose={() => setUserModalOpen(false)}
    onCreated={() => setRefreshKey((k) => k + 1)}
  />
</Modal>

    </div>
  

 
  </div>

  {/* Bloque 2: Registrar Departamentos */}
  <div className={`p-6 rounded-2xl shadow-md transition-colors ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
    <h3 className="text-xl font-bold mb-2">🏢 Registrar Departamentos</h3>
    <p className="mb-4 text-sm text-gray-400 dark:text-gray-300">Agrega y gestiona los departamentos de la organización.</p>
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => setDepartmentModalOpen(true)}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        + Registrar Departamento
      </button>
      <Link
        to="/admin/departamentos"
        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 text-center rounded-lg transition-colors"
      >
        ✏️ Actualizar Departamento
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
        <TableUsers refreshKey={refreshKey} />
      </div>
    </div>
  )
}
