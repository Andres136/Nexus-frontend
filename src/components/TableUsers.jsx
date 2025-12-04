import { PencilIcon } from '@heroicons/react/16/solid';
import useSystem from '../hooks/useSystem';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState, } from 'react';
import Modal from './calidad/Modal';
import UpdateUser from './calidad/UpdateUser';
import RegistrarRutas from '../views/Roles/RegistrarRutas';


/**
 * El componente TableUsers obtiene y muestra una lista paginada de usuarios.
 * Permite alternar el estado de activación de cada usuario.
 *
 * @component
 * @example
 * return (
 *   <TableUsers />
 * )
 *
 * @returns {JSX.Element} El componente renderizado.
 *
 * @function
 * @name TableUsers
 *
 * @description
 * Este componente obtiene una lista de usuarios de la API y los muestra en una tabla.
 * Soporta paginación y permite alternar el estado de activación de cada usuario.
 * El componente también adapta sus estilos según la configuración de modo oscuro del sistema.
 *
 * @property {Array} users - La lista de usuarios obtenida de la API.
 * @property {Object} pagination - La información de paginación para la lista de usuarios.
 * @property {boolean} loading - Indica si los usuarios están siendo cargados.
 *
 * @method
 * @name obtenerUsuarios
 * @description Obtiene la lista de usuarios de la API.
 * @param {number} [page=1] - El número de página a obtener.
 *
 * @method
 * @name toggleEstadoUsuario
 * @description Alterna el estado de activación de un usuario.
 * @param {number} id - El ID del usuario.
 * @param {number} estadoActual - El estado de activación actual del usuario.
 *
 * @hook
 * @name useEffect
 * @description Obtiene los usuarios cuando el componente se monta.
 *
 * @hook
 * @name useSystem
 * @description Recupera la configuración de modo oscuro del sistema.
 */
export default function TableUsers({onClose}) {
 
 const { darkMode} = useSystem();
 const [isUserModalOpen, setUserModalOpen] = useState(false);

 const {users, pagination,obtenerUsuarios,toggleEstadoUsuario,  loading}=useAuth({middleware: "auth"})
 
  const  [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    obtenerUsuarios(1, search);
  };
  
  useEffect(() => {
    obtenerUsuarios();
  }, []);


 

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="text-center py-4">Cargando usuarios...</div>
      ) : (
        <>
        <div className="flex items-center mb-4">
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Buscar usuario..."
    className="border p-2 rounded mr-2"
  />
  <button
    onClick={handleSearch}
    className="bg-blue-600 text-white px-3 py-1 rounded"
  >
    Buscar
  </button>
</div>

          <table className={
            darkMode
              ? "bg-gray-800 text-white p-4 table-auto w-full border-collapse "
              : "bg-white text-gray-900 shadow-md p-4 table-auto w-full border-collapse border border-gray-300 bg-white rounded-md shadow-md"
          }>
            <thead>
              <tr className={darkMode ? "bg-gray-800 text-white p-4" : "bg-gray-100 text-gray-900"}>
                <th className="border border-gray-300 px-4 py-2">Editar</th>
                <th className="border border-gray-300 px-4 py-2">Estado</th>
                <th className="border border-gray-300 px-4 py-2">Nombre</th>
                <th className="border border-gray-300 px-4 py-2">Correo</th>
                <th className="border border-gray-300 px-4 py-2">Teléfono</th>
                <th className="border border-gray-300 px-4 py-2">Rol</th>
                <th className="border border-gray-300 px-4 py-2">Departamento</th>
                <th className="border border-gray-300 px-4 py-2">Sede</th>
          
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 border-b">
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className="flex items-center bg-green-700 text-white px-3 py-1 rounded hover:bg-gray-800"
                      onClick={async () => {
                        setSelectedUser(row.id);
                        setUserModalOpen(true);
                    }}
                    
                      
                    >
                      <PencilIcon className="h-5 w-5 mr-1" />
                      Editar

                    </button>
                    <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
                      
              <UpdateUser userId={selectedUser} onClose={()=>setUserModalOpen(false)} />
            </Modal>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className={`flex items-center ${
                        row.estado_id === 3 ? 'bg-gray-800 hover:bg-green-700' : 'bg-green-700 hover:bg-green-700'
                      } text-white px-3 py-1 rounded`}
                      onClick={() => toggleEstadoUsuario(row.id, row.estado_id)}
                    >
                      {row.estado_id === 3 ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{row.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.telefono}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.role?.nombre || "Sin rol"}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.departamento?.nombre || "Sin departamento"}

                  </td>
                  <td className="border border-gray-300 px-4 py-2">{row.sede?.nombre || "Sin sede"}</td>
           
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">Total registros: {pagination.total}</span>
            <div className="flex space-x-4">
              <button
                disabled={pagination.current_page === 1}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
                onClick={() => obtenerUsuarios(pagination.current_page - 1)}
              >
                Anterior
              </button>
              <span>Página {pagination.current_page} de {pagination.last_page}</span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
                onClick={() => obtenerUsuarios(pagination.current_page + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      <RegistrarRutas />
    </div>
  );
}
