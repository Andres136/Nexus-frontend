import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import Select from "react-select/async";
import Swal from "sweetalert2";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,

  ChevronLeft,
  ChevronRight,
  X,
  Send,
  UserCheck,
  Trash2,
  Edit
} from "lucide-react";

export default function Pqr() {
  const [pqrs, setPqrs] = useState([]);
  const [empresa, setEmpresa] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
 
  const { obtenerUsuarios, users, user } = useAuth({ middleware: "auth" });

  const fetchPqrs = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await clienteAxios.get(`/api/pqrs`, {
        params: {
          empresa,
          estado,
          page: pagina
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPqrs(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        total: response.data.total,
        prev_page_url: response.data.prev_page_url,
        next_page_url: response.data.next_page_url,
      });

    } catch (error) {
      console.error("Error al cargar PQRs", error);
    }
  };

  const cambiarEstado = async (id, estadoId) => {
    const nuevoEstado = estadoId === 1 ? 2 : 1;
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas cambiar el estado de esta PQR?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          const response = await clienteAxios.put(`/api/pqrs/${id}/estado`, { estado_id: nuevoEstado }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success(response.data.message);
          fetchPqrs();
        } catch (error) {
          console.error("❌ Error al cambiar el estado", error);
          toast.error("Error al cambiar el estado");
        }
      }
    });
  };

  useEffect(() => {
    fetchPqrs();
    obtenerUsuarios();
  }, [empresa, estado, pagina]);

  const asignarResponsable = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.put(
        `/api/pqrs/${mensajeSeleccionado.id}/asignar`,
        { asignado_a: mensajeSeleccionado.asignado_a },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message);
      fetchPqrs();
      setMensajeSeleccionado(null);
    } catch (error) {
      console.log(error);
      toast.error("Error al asignar responsable.");
      console.error(error);
    }
  };
  
  const confirmarEliminacion = (id) => {
    Swal.fire({
      title: '¿Deseas eliminar esta PQR?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          await clienteAxios.delete(`/api/pqrs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("PQR eliminada correctamente");
          fetchPqrs();
        } catch (error) {
          console.log("❌ Error al eliminar PQR", error);
          toast.error("Error al eliminar PQR");
        }
      }
    });
  };

const cargarOpcionesUsuarios = async (inputValue) => {
  try {
    const token = localStorage.getItem("token");
    const response = await clienteAxios.get(`/api/usuarios/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: inputValue }
    });

    return response.data.map((u) => ({
      value: u.id,
      label: u.name,
    }));

  } catch (error) {
    console.error("Error cargando usuarios dinámicamente:", error);
    return [];
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ✅ Header mejorado */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestión de PQRs
              </h1>
              <p className="text-gray-600 mt-1">
                Administra peticiones, quejas y reclamos
              </p>
            </div>
          </div>

          {/* ✅ Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                <div>
                  <p className="text-emerald-100 text-sm">Total PQRs</p>
                  <p className="text-2xl font-bold">{pagination.total || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="text-blue-100 text-sm">Resueltas</p>
                  <p className="text-2xl font-bold">
                    {pqrs.filter(p => p.estado_id === 2).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6" />
                <div>
                  <p className="text-orange-100 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold">
                    {pqrs.filter(p => p.estado_id === 1).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-lg text-white">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <div>
                  <p className="text-purple-100 text-sm">Sin Asignar</p>
                  <p className="text-2xl font-bold">
                    {pqrs.filter(p => !p.asignado_a).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Filtros mejorados */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-700">Filtros</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por empresa..."
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por estado..."
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Tabla moderna */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Lista de PQRs</h3>
              <span className="text-sm text-gray-600">
                Página {pagination.current_page} • {pqrs.length} registros
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Empresa
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contacto
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Responsable
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Mensaje
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Estado
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fechas
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pqrs.map((pqr) => (
                  <tr key={pqr.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{pqr.nombre}</div>
                        {pqr.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            {pqr.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{pqr.empresa}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{pqr.telefono}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {pqr.asignado ? (
                          <>
                            <div className="bg-green-100 p-1 rounded-full">
                              <UserCheck className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-green-700">
                              {pqr.asignado.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-100 p-1 rounded-full">
                              <User className="w-3 h-3 text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500">Sin asignar</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setMensajeSeleccionado(pqr)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Mensaje
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {pqr.estado_id === 1 ? (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pqr.estado?.nombre || "Pendiente"}
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {pqr.estado?.nombre || "Resuelto"}
                            </span>
                          )}
                        </div>
                        {user?.role_id === 1 && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => cambiarEstado(pqr.id, pqr.estado_id)}
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Cambiar
                            </button>
                            <button
                              onClick={() => confirmarEliminacion(pqr.id)}
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(pqr.created_at).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>
                            Act: {new Date(pqr.updated_at).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Paginación mejorada */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={!pagination.prev_page_url}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Página <span className="font-semibold">{pagination.current_page}</span>
                </span>
                <div className="text-sm text-gray-500">
                  ({pagination.total} total)
                </div>
              </div>

              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={!pagination.next_page_url}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Modal mejorado */}
        {mensajeSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Detalles de la PQR</h3>
                      <p className="text-blue-100 text-sm">
                        ID: #{mensajeSeleccionado.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMensajeSeleccionado(null)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Información del cliente */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información del Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium">{mensajeSeleccionado.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Empresa</p>
                        <p className="font-medium">{mensajeSeleccionado.empresa}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Correo</p>
                        <p className="font-medium">{mensajeSeleccionado.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{mensajeSeleccionado.telefono}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Mensaje
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {mensajeSeleccionado.mensaje}
                    </p>
                  </div>
                </div>

                {/* Asignar responsable */}
                {user?.role_id === 1 && (
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Asignar Responsable
                    </label>
                <Select
  cacheOptions
  defaultOptions
  loadOptions={cargarOpcionesUsuarios}
  placeholder="Seleccionar responsable..."
  value={
    mensajeSeleccionado.asignado_a
      ? {
          value: mensajeSeleccionado.asignado_a,
          label:
            users.find((u) => u.id === mensajeSeleccionado.asignado_a)?.name ||
            "Seleccionado",
        }
      : null
  }
  onChange={(selected) =>
    setMensajeSeleccionado((prev) => ({
      ...prev,
      asignado_a: selected?.value || "",
    }))
  }
/>

                  </div>
                )}

                {/* Respuesta */}
                {(user?.role_id === 1 || user?.id === mensajeSeleccionado.asignado_a) && (
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Respuesta
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={mensajeSeleccionado.respuesta || ""}
                      onChange={(e) =>
                        setMensajeSeleccionado((prev) => ({
                          ...prev,
                          respuesta: e.target.value,
                        }))
                      }
                      placeholder="Escribe tu respuesta..."
                    />
                    
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token");
                            await clienteAxios.put(
                              `/api/pqrs/${mensajeSeleccionado.id}/responder`,
                              { respuesta: mensajeSeleccionado.respuesta },
                              {
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            toast.success("Respuesta guardada correctamente");
                            fetchPqrs();
                            setMensajeSeleccionado(null);
                          } catch (error) {
                            console.error("❌ Error al guardar la respuesta", error);
                            toast.error("Error al guardar la respuesta");
                          }
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                      >
                        <Send className="w-4 h-4" />
                        Guardar Respuesta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setMensajeSeleccionado(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={asignarResponsable}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                  >
                    <UserCheck className="w-4 h-4" />
                    Asignar Responsable
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}