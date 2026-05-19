import { FaEdit, FaTasks, FaSearch, FaHistory, FaSpinner, FaUserSlash, FaUser } from "react-icons/fa";
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

export default function ClientesList({ onClose }) {
  useAuth({ middleware: "auth" });
  const {
    clientes,
    paginaActual,
    totalPaginas,
    busqueda,
    setBusqueda,
    obtenerClientes,
    cambiarEstadoCliente,
  } = useClientes();

  const debouncedBusqueda = useDebounce(busqueda, 400);
  const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isGestionarModalOpen, setGestionarModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { formatearFecha } = useFormatoFecha();
  const { consultarHistorialCliente } = useClientes();
  const [clienteHistorial, setClienteHistorial] = useState(null);

  useEffect(() => {
    setLoading(true);
    obtenerClientes(1, debouncedBusqueda).finally(() => setLoading(false));
  }, [debouncedBusqueda]);

  const handleToggleEstado = (cliente) => {
    const isActivo = cliente.estado_id === 3;
    Swal.fire({
      title: isActivo ? "¿Desactivar cliente?" : "¿Activar cliente?",
      text: isActivo
        ? "El cliente dejará de estar disponible para procesos activos."
        : "El cliente volverá a estar disponible en el sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActivo ? "#d33" : "#16a34a",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isActivo ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        cambiarEstadoCliente(cliente.id);
        Swal.fire({
          title: isActivo ? "Cliente desactivado" : "Cliente activado",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const renderAcciones = (cliente) => (
    <div className="flex justify-center gap-1.5">
      <button
        title="Editar"
        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        onClick={() => { setSelectedUser(cliente.id); setUserModalOpen(true); }}
      >
        <FaEdit size={13} />
      </button>
      <button
        title={cliente.estado_id === 3 ? "Desactivar" : "Activar"}
        className={`p-2 rounded-lg text-white transition-colors shadow-sm ${
          cliente.estado_id === 3
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-green-600 hover:bg-green-700"
        }`}
        onClick={() => handleToggleEstado(cliente)}
      >
        {cliente.estado_id === 3 ? <FaUserSlash size={13} /> : <FaUser size={13} />}
      </button>
      <button
        title="Gestionar"
        className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
        onClick={() => { setSelectedUser(cliente.id); setGestionarModalOpen(true); }}
      >
        <FaTasks size={13} />
      </button>
      <button
        title="Historial"
        className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors shadow-sm"
        onClick={async () => {
          const historial = await consultarHistorialCliente(cliente.id);
          setClienteHistorial(historial);
        }}
      >
        <FaHistory size={13} />
      </button>
    </div>
  );

  return (
    <>
      <div className="p-4 space-y-4">
        
        {/* Buscador */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o NIT..."
            className="w-full border border-gray-300 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {loading && (
            <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={14} />
          )}
        </div>

        {/* ── VISTA ESCRITORIO: tabla ── */}
        <div className="hidden lg:block rounded-xl shadow border border-gray-200">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[780px] border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                  {["#", "Nombre", "Email", "Teléfono", "Nit / Cédula", "Última gestión", "Fecha creación"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap w-[140px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {clientes.length > 0 ? (
                  clientes.map((cliente, index) => (
                    <tr
                      key={cliente.id}
                      className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-gray-700">#{cliente.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-semibold ${
                            cliente.estado_id === 3 ? "bg-green-500" : "bg-red-500"
                          }`}>
                            {cliente.estado?.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{cliente.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{cliente.email}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{cliente.telefono}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{cliente.nit}</td>
                      <td className="px-4 py-3">
                        {cliente.ultima_gestion ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-blue-700 text-xs">{cliente.ultima_gestion.tipo_contacto}</span>
                            <span className="text-gray-400 text-[11px]">{formatearFecha(cliente.ultima_gestion.created_at)}</span>
                            <span className="text-green-600 text-[11px] font-medium">{cliente.ultima_gestion.usuario?.name}</span>
                          </div>
                        ) : (
                          <span className="text-red-400 text-xs italic">Sin gestión</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatearFecha(cliente.created_at)}</td>
                      <td className="px-4 py-3">
                        {renderAcciones(cliente)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
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

        {/* ── VISTA MÓVIL/TABLET: tarjetas ── */}
        <div className="lg:hidden space-y-3">
          {clientes.length > 0 ? (
            clientes.map((cliente) => (
              <div key={cliente.id} className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3">
                {/* Encabezado tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">{cliente.nombre}</p>
                    <p className="text-xs text-gray-500">{cliente.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-semibold shrink-0 ${
                    cliente.estado_id === 3 ? "bg-green-500" : "bg-red-500"
                  }`}>
                    {cliente.estado?.nombre}
                  </span>
                </div>

                {/* Datos secundarios */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                  <div><span className="font-medium text-gray-500">Teléfono: </span>{cliente.telefono}</div>
                  <div><span className="font-medium text-gray-500">NIT: </span>{cliente.nit}</div>
                  <div className="col-span-2"><span className="font-medium text-gray-500">Creado: </span>{formatearFecha(cliente.created_at)}</div>
                </div>

                {/* Última gestión */}
                {cliente.ultima_gestion ? (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs space-y-0.5">
                    <p className="font-semibold text-blue-700">{cliente.ultima_gestion.tipo_contacto}</p>
                    <p className="text-gray-500">{formatearFecha(cliente.ultima_gestion.created_at)} · {cliente.ultima_gestion.usuario?.name}</p>
                    {cliente.ultima_gestion.comentario && (
                      <p className="text-gray-600 line-clamp-2">{cliente.ultima_gestion.comentario}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-red-400 italic">Sin gestión registrada</p>
                )}

                {/* Acciones */}
                {renderAcciones(cliente)}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 py-12">
              <FaSearch size={24} className="opacity-30" />
              <span className="text-sm font-medium">No se encontraron clientes</span>
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-center gap-3">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              paginaActual === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-green-600"
            }`}
            onClick={() => { setSelectedUser(null); obtenerClientes(paginaActual - 1); }}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 border rounded-lg text-sm text-gray-700 bg-white">
            {paginaActual} <span className="text-gray-400">/</span> {totalPaginas}
          </span>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              paginaActual >= totalPaginas
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-green-600"
            }`}
            onClick={() => obtenerClientes(paginaActual + 1)}
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Modales — fuera del map para evitar duplicados */}
      <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)}>
        <UpdateClientes clienteId={selectedUser} onClose={() => setUserModalOpen(false)} />
      </Modal>

      <Modal isOpen={isGestionarModalOpen} onClose={() => setGestionarModalOpen(false)}>
        <GestionarClientes clienteId={selectedUser} onClose={() => setGestionarModalOpen(false)} />
      </Modal>

      <ModalClienteHistorial
        isOpen={clienteHistorial !== null}
        onClose={() => setClienteHistorial(null)}
        cliente={clienteHistorial}
        formatearFecha={formatearFecha}
      />
    </>
  );
}
