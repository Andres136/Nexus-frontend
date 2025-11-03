import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { ChevronDown, ChevronUp, Calendar, User, Building, Hash } from "lucide-react";

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actualizar, setActualizar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [tareasExpandidas, setTareasExpandidas] = useState(new Set());
  const { auth } = useAuth({ middleware: "auth" });

  const toggleTareaExpandida = (tareaId) => {
    const nuevasExpandidas = new Set(tareasExpandidas);
    if (nuevasExpandidas.has(tareaId)) {
      nuevasExpandidas.delete(tareaId);
    } else {
      nuevasExpandidas.add(tareaId);
    }
    setTareasExpandidas(nuevasExpandidas);
  };

  const obtenerTareas = async (paginaActual = 1) => {
    const token = localStorage.getItem("token");
    try {
      const response = await clienteAxios.get(
        `/api/tareas?page=${paginaActual}&usuario=${busqueda}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTareas(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        next_page_url: response.data.next_page_url,
        prev_page_url: response.data.prev_page_url,
        total: response.data.total,
      });
    } catch (error) {
      console.log("Error al obtener tareas", error);
      setTareas([]);
    }
  };

  const cambiarEstado = async (id, estado_id) => {
    const token = localStorage.getItem("token");
    try {
      const nuevoEstado = estado_id === 1 ? 2 : 1;
      await clienteAxios.patch(
        `/api/tareas/estado/${id}`,
        { estado_id: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActualizar(!actualizar);
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar estado");
      console.error("Error al actualizar estado", error);
    }
  };

  const generarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    try {
      await clienteAxios.get("api/tareas-vencidas", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error al generar notificaciones:", error);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    obtenerTareas(pagina);
    generarNotificaciones();
  }, [actualizar, pagina, busqueda]);

  return (
    <div className="container mx-auto text-sm p-6 bg-gray-50 min-h-screen">
      {/* Header mejorado */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📋 Gestión de Tareas
        </h1>
        <p className="text-gray-600">Administra y realiza seguimiento a todas las tareas asignadas</p>
      </div>

      {/* Input de búsqueda mejorado */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar tareas
              </label>
              <input
                type="text"
                placeholder="Buscar por usuario asignado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              />
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-semibold">{pagination.total || 0}</span> tareas encontradas
            </div>
          </div>
        </div>
      </div>

      {/* Lista de tareas mejorada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(tareas) && tareas.length > 0 ? (
          tareas.map((tarea) => {
            const estaExpandida = tareasExpandidas.has(tarea.id);
            const fechaLimite = tarea.fecha_fin ? new Date(tarea.fecha_fin) : null;
            const fechaCreacion = tarea.created_at ? new Date(tarea.created_at) : null;
            const esVencida = fechaLimite && fechaLimite < new Date() && tarea.estado_id === 1;
            
            return (
              <div
                key={tarea.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border-l-4 ${
                  tarea.estado_id === 1 
                    ? esVencida 
                      ? 'border-red-500' 
                      : 'border-yellow-500'
                    : 'border-green-500'
                }`}
              >
                {/* Header de la tarea */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">
                      {truncateText(tarea.nombre, 50)}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tarea.estado_id === 1 
                        ? esVencida
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {tarea.estado_id === 1 
                        ? esVencida 
                          ? 'Vencida' 
                          : 'Pendiente'
                        : 'Completada'}
                    </span>
                  </div>

                  {/* Descripción con truncado */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {estaExpandida 
                      ? tarea.descripcion 
                      : truncateText(tarea.descripcion, 80)
                    }
                  </p>

                  {/* Información básica siempre visible */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      <span>#{tarea.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{tarea.usuario?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Información expandible */}
                {estaExpandida && (
                  <div className="px-5 pb-3">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Departamento:</span>
                        <span>{tarea.departamentos?.nombre || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Fecha límite:</span>
                        <span className={esVencida ? 'text-red-600 font-semibold' : ''}>
                          {fechaLimite 
                            ? fechaLimite.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : "Sin definir"
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Fecha asignada:</span>
                        <span>
                          {fechaCreacion 
                            ? fechaCreacion.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : "N/A"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer de la tarea */}
                <div className="px-5 pb-5">
                  {/* Botón Leer más/menos */}
                  <button
                    onClick={() => toggleTareaExpandida(tarea.id)}
                    className="w-full mb-3 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-blue-200"
                  >
                    {estaExpandida ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Leer más
                      </>
                    )}
                  </button>

                  {/* Botón de estado */}
                  <button
                    className={`px-4 py-3 text-sm font-semibold rounded-lg w-full transition-all ${
                      tarea.estado_id === 1
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-green-500 hover:to-green-600 transform hover:scale-105"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed opacity-75"
                    }`}
                    onClick={() => cambiarEstado(tarea.id, tarea.estado_id)}
                    disabled={tarea.estado_id !== 1}
                  >
                    {tarea.estado_id === 1 ? (
                      <span className="flex items-center justify-center gap-2">
                        ⏳ Marcar como completada
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        ✅ Tarea completada
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay tareas disponibles
              </h3>
              <p className="text-gray-500">
                No se encontraron tareas que coincidan con tu búsqueda.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Paginación mejorada */}
      {pagination.total > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Mostrando página <span className="font-semibold">{pagination.current_page || 1}</span> de {Math.ceil(pagination.total / 10)} páginas
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                disabled={!pagination.prev_page_url}
                onClick={() => setPagina(pagina - 1)}
              >
                ← Anterior
              </button>
              
              <span className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
                {pagination.current_page || 1}
              </span>
              
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                disabled={!pagination.next_page_url}
                onClick={() => setPagina(pagina + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}