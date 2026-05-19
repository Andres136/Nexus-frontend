import { FaEdit, FaTrash, FaTasks, FaSearch,FaHistory, FaBan } from "react-icons/fa";
import { useClientes } from "../../hooks/useClientes";
import { useDebounce } from "../../hooks/useDebounce";
import Modal from "../../components/calidad/Modal";
import UpdateClientes from "../../components/crm/UpdateClientes";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useFormatoFecha } from "../../hooks/useFormatoFecha";
import ModalClienteHistorial from "../../components/crm/ModalClienteHistorial";
import Swal from "sweetalert2";
import GestionarClientes from "../../components/crm/GestionarClientes";


export default function ClientesList({ onClose}) {
const {user}=useAuth({middleware:'auth'});

  const {
    clientes,
    paginaActual,
    totalPaginas,
    busqueda,
    setBusqueda,
    obtenerClientes,
    cambiarEstadoCliente
  
  
    
  } = useClientes();
const debouncedBusqueda = useDebounce(busqueda, 400);
const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGestionarModalOpen, setGestionarModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { formatearFecha } = useFormatoFecha();
  const { consultarHistorialCliente } = useClientes();

const [clienteHistorial, setClienteHistorial] = useState(null);


  // Cuando cambie debouncedBusqueda, recargamos página 1
  useEffect(() => {
    setLoading(true);
    obtenerClientes(1, debouncedBusqueda)
      .finally(() => setLoading(false));
  }, [debouncedBusqueda]);

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
            onChange={e => setBusqueda(e.target.value)}
     
          />
            {loading && (
        <div className="mb-4 text-center text-gray-600">Cargando...</div>
      )}
        </div>
      
        {/* Tabla Responsiva */}
{/* Tabla Responsiva */}
<div className="rounded-xl overflow-hidden shadow-xl border border-gray-200">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[700px] border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Id</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Última gestión</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Comentario</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Fecha creación</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nombre</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider min-w-[130px]">Teléfono</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider min-w-[180px]">Dirección</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nit / Cédula</th>
          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {clientes.length > 0 ? (
          clientes.map((cliente, index) => (
            <tr
              key={cliente.id}
              className={`transition-colors duration-150 hover:bg-blue-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-gray-700 text-sm">#{cliente.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-white text-[10px] font-semibold ${
                      cliente.estado_id === 3 ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {cliente.estado?.nombre}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3">
                {cliente.ultima_gestion ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-blue-700 text-xs">
                      {cliente.ultima_gestion.tipo_contacto}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {formatearFecha(cliente.ultima_gestion.created_at)}
                    </span>
                    <span className="text-green-600 text-[11px] font-medium">
                      {cliente.ultima_gestion.usuario?.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-400 text-xs italic">Sin gestión</span>
                )}
              </td>

              <td className="px-4 py-3 max-w-[200px]">
                {cliente.ultima_gestion?.comentario ? (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {cliente.ultima_gestion.comentario}
                  </p>
                ) : (
                  <span className="text-gray-300 text-xs italic">Sin comentarios</span>
                )}
              </td>

              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formatearFecha(cliente.created_at)}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800 text-sm">{cliente.nombre}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{cliente.email}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-center">{cliente.telefono}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-center">{cliente.direccion}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-center font-mono">{cliente.nit}</td>

              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    title="Editar"
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={async () => {
                      setSelectedUser(cliente.id);
                      setUserModalOpen(true);
                    }}
                  >
                    <FaEdit size={13} />
                  </button>

                  <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
                    <UpdateClientes clienteId={selectedUser} onClose={() => setUserModalOpen(false)} />
                  </Modal>
<button
  title={
    cliente.estado_id === 3
      ? "Desactivar cliente"
      : "Activar cliente"
  }
  className={`p-2 rounded-lg text-white transition-colors shadow-sm ${
    cliente.estado_id === 3
      ? "bg-amber-500 hover:bg-amber-600"
      : "bg-green-600 hover:bg-green-700"
  }`}
  onClick={() => {

    const isActivo = cliente.estado_id === 3;

    Swal.fire({
      title: isActivo
        ? "¿Estás seguro de desactivar este cliente?"
        : "¿Deseas activar este cliente?",

      text: isActivo
        ? "El cliente dejará de estar disponible para procesos activos."
        : "El cliente volverá a estar disponible en el sistema.",

      icon: "warning",
      showCancelButton: true,

      confirmButtonColor: isActivo
        ? "#d33"
        : "#16a34a",

      cancelButtonColor: "#3085d6",

      confirmButtonText: isActivo
        ? "Sí, desactivar"
        : "Sí, activar",

      cancelButtonText: "Cancelar",

    }).then((result) => {

      if (result.isConfirmed) {

        cambiarEstadoCliente(cliente.id);

        Swal.fire({
          title: isActivo
            ? "Cliente desactivado"
            : "Cliente activado",

          text: isActivo
            ? "El cliente fue desactivado correctamente."
            : "El cliente fue activado correctamente.",

          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

      }

    });

  }}
>
  <FaBan size={13} />
</button>

                  <button
                    title="Gestionar"
                    className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                    onClick={async () => {
                      setSelectedUser(cliente.id);
                      setGestionarModalOpen(true);
                    }}
                  >
                    <FaTasks size={13} />
                  </button>

                  <Modal isOpen={isGestionarModalOpen} onClose={() => setGestionarModalOpen(false)}>
                    <GestionarClientes clienteId={selectedUser} onClose={() => setGestionarModalOpen(false)} />
                  </Modal>

                  <button
                    title="Historial"
                    onClick={async () => {
                      const historial = await consultarHistorialCliente(cliente.id);
                      console.log(historial);
                      setClienteHistorial(historial);
                    }}
                    className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <FaHistory size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="10" className="py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <FaSearch size={24} className="opacity-30" />
                <span className="text-sm font-medium">No se encontraron clientes</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
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
      <ModalClienteHistorial
  isOpen={clienteHistorial !== null}
  onClose={() => setClienteHistorial(null)}
  cliente={clienteHistorial}
  formatearFecha={formatearFecha}
/>

    </>
  );
}
