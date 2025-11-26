import { useEffect, useState } from "react";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { ChevronDown, ChevronUp, Calendar, User, Building, Hash, Edit3, X, Save } from "lucide-react";
import { BsListTask } from "react-icons/bs";

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actualizar, setActualizar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [tareasExpandidas, setTareasExpandidas] = useState(new Set());
  
  // ✅ ESTADOS SIMPLIFICADOS PARA EDICIÓN
  const [modalEdicion, setModalEdicion] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_fin: ''
  });
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  
  const { user } = useAuth({ middleware: "auth" });

  const toggleTareaExpandida = (tareaId) => {
    const nuevasExpandidas = new Set(tareasExpandidas);
    if (nuevasExpandidas.has(tareaId)) {
      nuevasExpandidas.delete(tareaId);
    } else {
      nuevasExpandidas.add(tareaId);
    }
    setTareasExpandidas(nuevasExpandidas);
  };

  // ✅ FUNCIONES SIMPLIFICADAS PARA EDICIÓN
  const abrirModalEdicion = (tarea) => {
    setTareaEditando(tarea);
    setFormData({
      nombre: tarea.nombre || '',
      descripcion: tarea.descripcion || '',
      fecha_fin: tarea.fecha_fin ? tarea.fecha_fin.split('T')[0] : ''
    });
    setModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setModalEdicion(false);
    setTareaEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_fin: ''
    });
  };

  const actualizarTarea = async () => {
    if (!tareaEditando) return;
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la tarea es obligatorio');
      return;
    }
    
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    setCargandoEdicion(true);
    const token = localStorage.getItem("token");
    
    try {
      // ✅ Solo enviar los campos editables, mantener usuario_id y departamento_id originales
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_fin: formData.fecha_fin || null,
        usuario_id: tareaEditando.usuario_id, // Mantener original
        departamento_id: tareaEditando.departamento_id // Mantener original
      };

      await clienteAxios.put(`/api/tareas/update/${tareaEditando.id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Tarea actualizada correctamente');
      cerrarModalEdicion();
      setActualizar(!actualizar); // Recargar lista
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar la tarea');
      }
    } finally {
      setCargandoEdicion(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones existentes...
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
          <BsListTask /> Gestión de Tareas
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
            
          // En la sección de cada tarjeta de tarea, alrededor de la línea 190:
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
        <h3 className="text-lg font-bold text-gray-800 leading-tight flex-1">
          {truncateText(tarea.nombre, 50)}
        </h3>
        
        <div className="flex items-center gap-2 ml-2">
          {/* ✅ Botón de editar - Solo para roles específicos */}
          {(user?.role_id === 1 || user?.role_id === 2) && (
            <button
              onClick={() => abrirModalEdicion(tarea)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar tarea"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          
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
      </div>

      {/* Descripción con truncado */}
      <p className="text-gray-600 mb-4 leading-relaxed">
        {estaExpandida 
          ? tarea.descripcion 
          : truncateText(tarea.descripcion, 80)
        }
      </p>

      {/* ✅ INFORMACIÓN BÁSICA EXPANDIDA - SIEMPRE VISIBLE */}
      <div className="grid grid-cols-1 gap-3 text-sm mb-4">
        
        {/* Primera fila */}
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span>#{tarea.id}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate">{tarea.usuario?.name || "N/A"}</span>
          </div>
        </div>

        {/* Segunda fila - Departamento */}
        <div className="flex items-center gap-2 text-gray-600">
          <Building className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-xs">Departamento:</span>
          <span className="text-sm font-semibold text-gray-900">
            {tarea.departamentos?.nombre || "N/A"}
          </span>
        </div>
        
        {/* Tercera fila - Fecha límite */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-green-500" />
          <span className="font-medium text-xs">Fecha límite:</span>
          <span className={`text-sm font-semibold ${esVencida ? 'text-red-600' : 'text-gray-900'}`}>
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

        {/* Cuarta fila - Fecha de asignación */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-xs">Fecha asignada:</span>
          <span className="text-sm text-gray-900">
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
            Ver menos detalles
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Ver más detalles
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

      {/* ✅ MODAL SIMPLIFICADO DE EDICIÓN */}
      {modalEdicion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar Tarea</h2>
                <p className="text-gray-600 text-sm">
                  ID: #{tareaEditando?.id} • Asignada a: {tareaEditando?.usuario?.name || 'N/A'}
                </p>
              </div>
              <button
                onClick={cerrarModalEdicion}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ✅ Información no editable */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Usuario asignado:</span>
                  <span className="text-gray-900">{tareaEditando?.usuario?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Departamento:</span>
                  <span className="text-gray-900">{tareaEditando?.departamentos?.nombre || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Contenido del modal - solo campos editables */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
              <div className="space-y-6">
                
                {/* Nombre de la tarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la tarea *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingrese el nombre de la tarea"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Describe la tarea detalladamente"
                  />
                </div>

                {/* Fecha límite */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional. Si no se especifica, la tarea no tendrá fecha límite.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={cerrarModalEdicion}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={cargandoEdicion}
              >
                Cancelar
              </button>
              <button
                onClick={actualizarTarea}
                disabled={cargandoEdicion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cargandoEdicion ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}