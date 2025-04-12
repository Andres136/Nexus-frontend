import { FaEdit, FaTrash, FaTasks, FaSearch,FaHistory } from "react-icons/fa";
import { useClientes } from "../../hooks/useClientes";
import Modal from "../../components/calidad/Modal";
import UpdateClientes from "../../components/crm/UpdateClientes";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

import Swal from "sweetalert2";
import GestionarClientes from "../../components/crm/GestionarClientes";

export default function ClientesList({ onClose,consultarHistorial }) {
const {user}=useAuth({middleware:'auth'});

  const {
    clientes,
    paginaActual,
    totalPaginas,
    busqueda,
    setBusqueda,
    obtenerClientes,
    eliminarCliente,
  
  
    
  } = useClientes();

  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGestionarModalOpen, setGestionarModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <>
      <div className="p-4">
        {/* Buscador */}
        <div className="flex items-center mb-4">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="border px-3 py-2 rounded-lg w-full"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              obtenerClientes(1, e.target.value);
            }}
          />
        </div>

        {/* Tabla Responsiva */}
        <div className="grid grid-cols-1 overflow-x-auto">
          <table className=" col-span-1 w-full min-w-[600px] border-collapse border border-gray-300 shadow-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Id</th>
                <th className="border border-gray-300 px-4 py-2">Nombre</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2 min-w-[150px]">
                  Teléfono
                </th>
                <th className="border border-gray-300 px-4 py-2 min-w-[200px]">
                  Dirección
                </th>
                <th>Nit o Cedula</th>
                <th className="border border-gray-300 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-100 transition">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {cliente.id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {cliente.nombre}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {cliente.email}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {cliente.telefono}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {cliente.direccion}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {cliente.nit}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 flex flex-wrap justify-center gap-2">
                      <button
                        className=" w-full sm:w-auto max-w-full bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition"
                        onClick={async () => {
                          setSelectedUser(cliente.id);
                          setUserModalOpen(true);
                        }}
                      >
                        <FaEdit /> Editar
                      </button>

                      <Modal
                        isOpen={isUserModalOpen}
                        onClose={() => setUserModalOpen(false)}
                      >
                        <UpdateClientes
                          clienteId={selectedUser}
                          onClose={() => setUserModalOpen(false)}
                        />
                      </Modal>
                     {/* Solo mostrar el botón si el usuario tiene rol 1 */}
        {user.role_id === 1 && (
          <button
            className="w-full sm:w-auto max-w-full bg-red-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
            onClick={() => {
              Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
              }).then((result) => {
                if (result.isConfirmed) {
                  eliminarCliente(cliente.id);
                  Swal.fire("Eliminado", "El cliente ha sido eliminado.", "success");
                }
              });
            }}
          >
            <FaTrash /> Eliminar
          </button>
        )}

                      <button
                        className="w-full sm:w-auto max-w-full bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-green-600 transition"
                        onClick={async () => {
                          setSelectedUser(cliente.id);
                          setGestionarModalOpen(true);
                        }}
                      >
                        <FaTasks /> Gestionar
                      </button>
                      <Modal
                        isOpen={isGestionarModalOpen}
                        onClose={() => setGestionarModalOpen(false)}
                      >
                        <GestionarClientes
                       clienteId={selectedUser}
                          onClose={() => setGestionarModalOpen(false)}
                        />
                      </Modal>

                     <button
                     className="w-full sm:w-auto max-w-full bg-gray-700 text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                     onClick={async()=> consultarHistorial(cliente.id)}>Historial
                     <FaHistory/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-4 gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${
              paginaActual === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-green-600"
            }`}
            onClick={() => {setSelectedUser(null); obtenerClientes(paginaActual - 1)}}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span className="px-4 py-2 border rounded-lg">
            {paginaActual} / {totalPaginas}
          </span>
          <button
            className={`px-4 py-2 rounded-lg ${
              paginaActual >= totalPaginas
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-green-600"
            }`}
            onClick={() => obtenerClientes(paginaActual + 1)}
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
